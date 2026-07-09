/**
 * TMDB Layer Barrel Export
 *
 * Re-exports TMDB-related modules and types.
 * Note: Application code should NOT import TMDB modules directly.
 * Use the content layer (src/lib/content/) instead.
 */

// Types
export * from './types';

// Configuration
export * from './config';

// Client (low-level, should not be used directly by UI)
export * from './client';

// Generic abstractions (for extending to new content types)
export * from './TmdbDataSource';
export * from './ContentMapper';

// Services
export * from './services/movieService';

// Data Sources
export * from './datasources/movieDataSource';

// Mappers
export * from './mappers/movieMapper';
export * from './mappers/personMapper';
export * from './mappers/genreMapper';