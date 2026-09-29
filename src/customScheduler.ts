import { ScheduleInput, ScheduleResult, superMemo } from './scheduling';
import { SpacingMethod } from './types';

/** Custom functions may omit ease when their policy only uses intervals. */
export interface CustomScheduleResult {
	interval: number;
	easeFactor?: number;
}

export type Scheduler = (input: Readonly<ScheduleInput>) => CustomScheduleResult;

/** Only canonical vault-relative JavaScript paths are accepted. */
export function scriptPath(value: string): string {
	const path = value.trim();
	if (!path || !path.endsWith('.js') || /[\\:\x00-\x1f]/.test(path) ||
		path.split('/').some(part => !part || part === '.' || part === '..')) {
		throw new Error('Set Custom script to a vault-relative .js path, such as scripts/custom-scheduler.js (no absolute paths or ..).');
	}
	return path;
}

/**
 * Resolve a method once per review. File access stays outside the pure scheduler.
 * Scripts use module.exports, run synchronously, and are reloaded on each review.
 * new Function executes trusted code with host privileges; this is NOT a sandbox.
 */
export async function loadScheduler(
	method: Pick<SpacingMethod, 'spacingAlgorithm' | 'customScriptFileName'>,
	read: (path: string) => Promise<string>
): Promise<Scheduler> {
	if (method.spacingAlgorithm === 'SuperMemo2.0') return superMemo;
	if (method.spacingAlgorithm !== 'Custom') {
		throw new Error(`Unknown spacing algorithm "${method.spacingAlgorithm}". Choose SuperMemo 2.0 or Custom script in settings.`);
	}
	const path = scriptPath(method.customScriptFileName || '');
	try {
		const source = await read(path);
		const module: { exports: unknown } = { exports: {} };
		new Function('module', 'exports', '"use strict";\n' + source)(module, module.exports);
		if (typeof module.exports !== 'function') {
			throw new Error('Script must export a synchronous function with module.exports = (input) => ({ interval: ... }).');
		}
		const scheduler = module.exports as Scheduler;
		return input => {
			try {
				return scheduler(input);
			} catch (error) {
				throw new Error(`Custom script "${path}" failed: ${error instanceof Error ? error.message : String(error)}`);
			}
		};
	} catch (error) {
		throw new Error(`Cannot load custom script "${path}": ${error instanceof Error ? error.message : String(error)}`);
	}
}

function positive(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/** Validate before any metadata is changed; expose only numeric scheduling state. */
export function calculateSchedule(scheduler: Scheduler, input: ScheduleInput): ScheduleResult {
	if (!positive(input.interval) || !positive(input.easeFactor) || !Number.isFinite(input.reviewScore)) {
		throw new Error('Scheduling requires positive finite interval/ease values and a finite review score. Check the note and spacing method settings.');
	}
	const result = scheduler(Object.freeze({ ...input }));
	if (result && typeof (result as unknown as { then?: unknown }).then === 'function') {
		// Consume a rejected async return to avoid an unhandled rejection; never use its result.
		void Promise.resolve(result).catch(() => undefined);
		throw new Error('Scheduling must return a result synchronously; async functions and Promises are not supported.');
	}
	if (!result || typeof result !== 'object' || Array.isArray(result)) {
		throw new Error('Scheduling must return an object with a positive finite interval in days.');
	}
	const interval = result.interval;
	const easeFactor = result.easeFactor === undefined ? input.easeFactor : result.easeFactor;
	if (!positive(interval) || !positive(easeFactor)) {
		throw new Error('Scheduling must return a positive finite interval and, if supplied, a positive finite easeFactor.');
	}
	return { interval, easeFactor };
}
