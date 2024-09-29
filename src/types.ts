
export interface Context {
	name: string;
	isActive: boolean;
	spacingMethodName?: string;
}

export interface ReviewOption {
	name: string;
	score: number;
}

export interface SpacingMethod {
	name: string;
	spacingAlgorithm: string;
	customScriptFileName: string;
	reviewOptions: ReviewOption[];
	defaultInterval: number;
	defaultEaseFactor?: number; // optional because may only be relevant to SM-2
}
