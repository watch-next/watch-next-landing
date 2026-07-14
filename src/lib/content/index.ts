/**
 * Content Layer Barrel Export
 *
 * Re-exports content-related modules and types.
 */

// Types
export * from './types';

// Utilities
export * from './slugify';

// Generic abstractions (for future content types)
export * from './ContentRepository';

// Repositories (Backend-backed)
export * from './MovieRepository';
export * from './SeriesRepository';

// Provider interface
export * from './ContentProvider';