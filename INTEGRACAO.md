# Watch Next - Integração Frontend-Backend

## Visão Geral

Este documento descreve a integração entre o frontend (Vue 3 + Vite) e o backend (FastAPI + PostgreSQL).

## Configuração

### Backend

```bash
cd C:\GitHub\apps\watch-next-backend

# Ambiente
.venv\Scripts\activate

# Iniciar servidor
uvicorn app.main:app --reload --port 8000
```

**URL:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

### Frontend

```bash
cd C:\GitHub\apps\watch-next-landing

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env.local

# Iniciar dev server
npm run dev
```

**URL:** http://localhost:5173
**API URL:** http://localhost:8000/api/v1

---

## Autenticação

### Serviços Disponíveis

```typescript
import {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  fetchCurrentUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from '@/services/authService';

import { useAuth } from '@/composables/useAuth';
```

### Exemplo de Uso

```vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';

const { user, isAuthenticated, isLoading, login, logout } = useAuth();

// Login
const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password);
    // Usuário autenticado
  } catch (error) {
    // Handle error
  }
};

// Logout
const handleLogout = async () => {
  await logout();
};
</script>
```

### Fluxo JWT

1. **Login** → `POST /api/v1/auth/login`
   - Retorna: `{ user, access_token, refresh_token }`
   - Tokens são salvos no `localStorage`

2. **Requisições Autenticadas**
   - `Authorization: Bearer <access_token>`
   - Adicionado automaticamente pelo `httpClient`

3. **Token Expirado (401)**
   - Cliente chama automaticamente `POST /api/v1/auth/refresh`
   - Novo token é armazenado
   - Requisição original é重试

4. **Logout** → `POST /api/v1/auth/logout`
   - Invalida refresh token no backend
   - Limpa localStorage

---

## Endpoints de Filmes

### Data Source

```typescript
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchTrendingMovies,
  fetchUpcomingMovies,
  fetchNowPlayingMovies,
  fetchMovieDetails,
  fetchMovieCredits,
  fetchMovieVideos,
  fetchSimilarMovies,
  fetchMovieWatchProviders,
  searchMovies,
} from '@/lib/api/movieDataSource';
```

### Exemplo de Uso

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchPopularMovies } from '@/lib/api/movieDataSource';

const movies = ref([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const data = await fetchPopularMovies(1, 20);
    movies.value = data.results;
  } catch (error) {
    console.error('Failed to fetch movies:', error);
  } finally {
    loading.value = false;
  }
});
</script>
```

### Endpoints Backend

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/v1/movies` | ❌ | Lista todos (paginado) |
| GET | `/api/v1/movies/popular` | ❌ | Filmes populares |
| GET | `/api/v1/movies/top-rated` | ❌ | Melhor avaliados |
| GET | `/api/v1/movies/trending` | ❌ | Em alta |
| GET | `/api/v1/movies/upcoming` | ❌ | Lançamentos |
| GET | `/api/v1/movies/now-playing` | ❌ | Nos cinemas |
| GET | `/api/v1/movies/{tmdb_id}` | ❌ | Detalhes |
| GET | `/api/v1/movies/{id}/credits` | ❌ | Elenco |
| GET | `/api/v1/movies/{id}/videos` | ❌ | Trailers |
| GET | `/api/v1/movies/{id}/similar` | ❌ | Similares |
| GET | `/api/v1/movies/{id}/providers` | ❌ | Streamings |

---

## Endpoints de TV Shows

### Data Source

```typescript
import {
  fetchPopularShows,
  fetchTopRatedShows,
  fetchTrendingShows,
  fetchTVShowDetails,
  fetchSeasonDetails,
  fetchEpisodeDetails,
  fetchSimilarShows,
} from '@/lib/api/tvDataSource';
```

### Endpoints Backend

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/v1/tv` | ❌ | Lista todos (paginado) |
| GET | `/api/v1/tv/popular` | ❌ | Séries populares |
| GET | `/api/v1/tv/top-rated` | ❌ | Melhor avaliadas |
| GET | `/api/v1/tv/trending` | ❌ | Em alta |
| GET | `/api/v1/tv/{tmdb_id}` | ❌ | Detalhes |
| GET | `/api/v1/tv/{id}/season/{season}` | ❌ | Temporada |
| GET | `/api/v1/tv/{id}/season/{s}/episodes/{e}` | ❌ | Episódio |
| GET | `/api/v1/tv/{id}/similar` | ❌ | Similares |

---

## Watchlist & Favoritos

### Endpoints (Auth Required)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/watchlist` | Get watchlist do usuário |
| POST | `/api/v1/watchlist` | Adicionar à watchlist |
| DELETE | `/api/v1/watchlist/{id}` | Remover da watchlist |
| GET | `/api/v1/favorites` | Get favoritos do usuário |
| POST | `/api/v1/favorites` | Adicionar favorito |
| DELETE | `/api/v1/favorites/{id}` | Remover favorito |

### Exemplo de Uso

```typescript
import { httpClient } from '@/lib/http/client';

// Adicionar à watchlist
async function addToWatchlist(tmdbId: number, type: 'movie' | 'tv') {
  const response = await httpClient.post('/watchlist', {
    tmdb_id: tmdbId,
    content_type: type,
  });
  return response.data;
}

// Remover da watchlist
async function removeFromWatchlist(id: string) {
  await httpClient.delete(`/watchlist/${id}`);
}
```

---

## Busca

```typescript
import { httpClient } from '@/lib/http/client';

// Busca unificada
async function search(query: string, page = 1) {
  const response = await httpClient.get('/search', {
    params: { q: query, page },
  });
  return response.data;
}
```

---

## Tratamento de Erros

```typescript
import {
  httpClient,
  ApiError,
  UnauthorizedError,
  NotFoundError,
  NetworkError,
} from '@/lib/http/client';

try {
  const response = await httpClient.get('/movies/popular');
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // Redirecionar para login
  } else if (error instanceof NotFoundError) {
    // 404 handling
  } else if (error instanceof NetworkError) {
    // Backend offline
  } else {
    // Outros erros
  }
}
```

---

## Migrando do TMDB Direto

### Antes (TMDB Direto)

```typescript
import { tmdbGet } from '@/lib/tmdb/client';

const response = await tmdbGet('/movie/popular');
```

### Depois (Backend)

```typescript
import { fetchPopularMovies } from '@/lib/api/movieDataSource';

const response = await fetchPopularMovies(1, 20);
```

**Vantagens:**
- Cache no backend (Redis + PostgreSQL)
- Fallback automático TMDB → DB
- Dados normalizados
- Um único endpoint para todo conteúdo
- Sem expor API key do TMDB no frontend

---

## CORS

### Backend Configuration

```python
# .env
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend Vite Config

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    // Não precisa de proxy - CORS já configurado
  },
});
```

---

## Environment Variables

### Frontend `.env.local`

```env
# API Backend
VITE_API_URL=http://localhost:8000/api/v1

# TMDB (apenas para URLs de imagem)
VITE_TMDB_IMAGE_URL=https://image.tmdb.org

# Supabase (apenas blog CMS - não remover)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Backend `.env`

```env
DATABASE_URL=postgresql+asyncpg://postgres:pass@localhost:5432/watch-next-db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-min-32-chars
TMDB_API_KEY=your-tmdb-api-key
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PORT=8000
```

---

## Validação da Integração

### Checklist

- [ ] Backend rodando em http://localhost:8000
- [ ] Frontend rodando em http://localhost:5173
- [ ] `VITE_API_URL` configurada corretamente
- [ ] CORS permitindo localhost:5173
- [ ] Health check respondendo: `GET /health/live`
- [ ] Login funcionando: `POST /api/v1/auth/login`
- [ ] Filmes populares: `GET /api/v1/movies/popular`
- [ ] Séries populares: `GET /api/v1/tv/popular`
- [ ] Watchlist/Favoritos (auth required)

### Teste Rápido

```bash
# Backend health
curl http://localhost:8000/health/live

# API endpoint
curl http://localhost:8000/api/v1/movies/popular

# Login (substitua credenciais)
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## Troubleshooting

### Erro: "Cannot connect to API server"

**Causa:** Backend offline ou URL errada

**Solução:**
1. Verificar se backend está rodando: `curl http://localhost:8000/health/live`
2. Verificar `.env.local`: `VITE_API_URL=http://localhost:8000/api/v1`
3. Reiniciar dev server: `npm run dev`

### Erro: 401 Unauthorized

**Causa:** Token expirado ou inválido

**Solução:**
1. Fazer logout e login novamente
2. Verificar refresh token: `POST /api/v1/auth/refresh`
3. Limpar localStorage manualmente

### Erro: CORS no browser

**Causa:** Backend não permite origem do frontend

**Solução:**
1. Backend `.env`: `ALLOWED_ORIGINS=http://localhost:5173`
2. Reiniciar backend
3. Clear cache do browser

---

## Próximos Passos

Após validar a integração local:

1. **Produção**
   - Dockerfile backend
   - docker-compose.yml
   - Variáveis de ambiente seguras
   - GitHub Actions CI/CD

2. **Frontend**
   - Build de produção
   - Hospedagem (Vercel, Netlify)
   - API URL de produção

3. **Monitoramento**
   - Logs backend
   - Error tracking (Sentry)
   - Health checks

---

## Recursos Adicionais

- **Backend Swagger:** http://localhost:8000/docs
- **TMDB API Docs:** https://developer.themoviedb.org/reference
- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **Vue 3 Docs:** https://vuejs.org/