---
name: MoviePage UUID endpoint migration
description: MoviePage migrada para GET /movies/{uuid} com extração do UUID via regex, chips de gênero, tratamento de erro
type: project
---

**Causa Raiz do Bug "undefined" (2026-07-14):**

O frontend recebia a resposta da API no formato envelopado:
```json
{
  "success": true,
  "data": { ...movie details }
}
```

Mas o código estava retornando `response.data` diretamente em vez de `response.data.data`.

**Locais corrigidos:**

1. `src/services/movie.service.ts` - `getMovieByUuid()` e `getWatchProviders()`
2. `src/lib/api/movieDataSource.ts` - `fetchMovieDetails()` e `fetchMovieCredits()`

**Padrão do backend:**
- Listas: `{ data: [], total, page, ... }` → acessar `response.data.data`
- Detalhes (single resource): `{ success: true, data: {...} }` → acessar `response.data.data`

**Extração do ID na MoviePage:**
- Slug pode ser `{tmdb_id}-{title}` (ex: `550-obsession`) ou `{uuid}-{title}` (ex: `9f5de6b-...-obsession`)
- Regex tenta UUID primeiro, fallback para `split('-')[0]`