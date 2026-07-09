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

// Repository (TMDB-backed)
export * from './MovieRepository';

// Legacy static provider (Markdown-based) - DEPRECATED - remove after migration
// Note: StaticContentProvider was removed in Phase 5

// Provider interface
export * from './ContentProvider';