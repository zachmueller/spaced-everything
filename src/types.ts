/**
 * Type Definitions - Centralized domain model for spaced repetition
 * 
 * This file defines the core data structures used throughout the plugin.
 * These interfaces represent the domain concepts of spaced repetition:
 * contexts (review queues), spacing methods (algorithms), and review
 * options (quality scores).
 * 
 * This file contains only type definitions with no runtime code, making
 * it safe to import anywhere without circular dependency concerns.
 * 
 * Key exports: Context, ReviewOption, SpacingMethod
 * Dependencies: None (pure type definitions)
 */

/**
 * Context - A group of notes with independent review schedules
 * 
 * Contexts allow users to organize notes into separate review queues
 * with different spacing configurations. For example, language learning
 * notes might be reviewed daily with aggressive spacing, while reference
 * notes are reviewed monthly with relaxed spacing.
 * 
 * Each context has its own active/inactive state and can optionally
 * override the default spacing method.
 */
export interface Context {
	/**
	 * Unique identifier for this context
	 * 
	 * Used in note frontmatter to link notes to contexts. Must be unique
	 * within the plugin settings to avoid ambiguity.
	 * 
	 * Example: 'language-learning', 'reference', 'active-projects'
	 */
	name: string;

	/**
	 * Whether this context is currently active for reviews
	 * 
	 * Inactive contexts are excluded from the review queue, allowing users
	 * to temporarily pause reviews for specific note categories without
	 * deleting the context configuration.
	 * 
	 * Default: true when creating new contexts
	 */
	isActive: boolean;

	/**
	 * Name of spacing method to use for this context
	 * 
	 * If specified, overrides the default spacing method for notes in this
	 * context. If undefined, notes use the plugin's default spacing method.
	 * 
	 * Must match the name of a configured SpacingMethod.
	 * 
	 * Example: 'aggressive-daily', 'relaxed-monthly'
	 */
	spacingMethodName?: string;
}

/**
 * ReviewOption - A quality score option presented during review
 * 
 * Review options are shown to users when reviewing notes. Each option
 * represents a level of recall quality and has an associated score that
 * affects how the SuperMemo 2.0 algorithm calculates the next interval.
 * 
 * Standard SuperMemo 2.0 uses scores 0-5, but this can be customized
 * to provide more or fewer options based on user preference.
 */
export interface ReviewOption {
	/**
	 * Display label shown to user during review
	 * 
	 * Should clearly describe the recall quality this option represents.
	 * 
	 * Example: 'Perfect recall', 'Recalled with difficulty', 'Complete blackout'
	 */
	name: string;

	/**
	 * Numeric score for SuperMemo 2.0 algorithm (typically 0-5)
	 * 
	 * Scores affect interval calculation:
	 * - Score 0-2: Failed recall → interval resets to minimum
	 * - Score 3-5: Successful recall → interval grows by ease factor
	 * 
	 * Higher scores also increase the ease factor, making future intervals
	 * grow faster for material that's easy to remember.
	 * 
	 * Standard SuperMemo 2.0 scale:
	 * - 0: Complete blackout (no recall)
	 * - 1: Incorrect but familiar
	 * - 2: Incorrect but on tip of tongue
	 * - 3: Correct with serious difficulty
	 * - 4: Correct with hesitation
	 * - 5: Perfect recall
	 */
	score: number;
}

/**
 * SpacingMethod - Configuration for a spaced repetition algorithm
 * 
 * Defines the algorithm and parameters used to calculate review intervals.
 * Each context can have its own spacing method, allowing different review
 * schedules for different types of notes.
 * 
 * This interface is designed to be extensible for future algorithms beyond
 * SuperMemo 2.0, though currently only SuperMemo 2.0 is implemented.
 */
export interface SpacingMethod {
	/**
	 * Unique identifier for this spacing method
	 * 
	 * Used to reference this method from context configurations.
	 * 
	 * Example: 'default', 'aggressive-daily', 'relaxed-monthly'
	 */
	name: string;

	/**
	 * Algorithm identifier
	 * 
	 * Specifies which spacing algorithm to use. Currently only
	 * 'SuperMemo 2.0' is supported, but the interface is designed
	 * to support future algorithms like Anki's FSRS.
	 * 
	 * Example: 'SuperMemo 2.0'
	 */
	spacingAlgorithm: string;

	/**
	 * Filename of custom algorithm script
	 * 
	 * Reserved for future extensibility. Would allow users to implement
	 * custom spacing algorithms via JavaScript files.
	 * 
	 * Currently unused but included for future-proofing.
	 */
	customScriptFileName: string;

	/**
	 * Review quality options for this spacing method
	 * 
	 * Defines the choices presented to users during review. Each option
	 * has a label and score that affects interval calculation.
	 * 
	 * Standard SuperMemo 2.0 uses 6 options (scores 0-5), but this can
	 * be customized to provide more or fewer options based on preference.
	 */
	reviewOptions: ReviewOption[];

	/**
	 * Initial interval in days for new notes
	 * 
	 * When a note is first onboarded to spaced repetition, this interval
	 * is used for the first review. After the first review, the SuperMemo
	 * 2.0 algorithm takes over and calculates subsequent intervals.
	 * 
	 * Default: 1 (review again tomorrow)
	 */
	defaultInterval: number;

	/**
	 * Initial ease factor for SuperMemo 2.0 algorithm
	 * 
	 * The ease factor determines how quickly intervals grow after successful
	 * reviews. Higher values mean intervals grow faster (material is easier).
	 * 
	 * Standard SuperMemo 2.0 default: 2.5 (intervals multiply by 2.5x)
	 * Valid range: 1.3 to 3.0+ (algorithm enforces minimum of 1.3)
	 * 
	 * Optional because this parameter is only relevant to SuperMemo 2.0.
	 * Future algorithms may not use an ease factor.
	 */
	defaultEaseFactor?: number; // optional because may only be relevant to SM-2
}
