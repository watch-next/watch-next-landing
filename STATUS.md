# Watch Next - Status da Integração

**Data:** 2026-07-13
**Status:** ✅ Integração Básica Completa

---

## ✅ Concluído

### 1. Cliente HTTP (Frontend)

**Arquivos Criados:**
- `src/lib/http/config.ts` - Configuração de baseURL e timeout
- `src/lib/http/error-handler.ts` - Classes de erro personalizadas
- `src/lib/http/client.ts` - Axios com interceptors JWT
- `src/lib/http/index.ts` - exports

**Features:**
- ✅ Injeção automática de Bearer Token
- ✅ Refresh automático em 401
- ✅ Tratamento centralizado de erros
- ✅ Persistência em localStorage
- ✅ Eventos de auth (login/logout)

---

### 2. Autenticação JWT (Frontend)

**Arquivos Criados:**
- `src/services/authService.ts` - Serviço completo de auth
- `src/services/types.ts` - Tipos TypeScript
- `src/composables/useAuth.ts` - Composable Vue 3

**Endpoints Suportados:**
- ✅ `POST /api/v1/auth/register`
- ✅ `POST /api/v1/auth/login`
- ✅ `POST /api/v1/auth/refresh`
- ✅ `POST /api/v1/auth/logout`
- ✅ `POST /api/v1/auth/verify`
- ✅ `POST /api/v1/auth/forgot-password`
- ✅ `POST /api/v1/auth/reset-password`
- ✅ `GET /api/v1/users/me`

---

### 3. Integração de Filmes (Frontend → Backend)

**Arquivos Criados:**
- `src/lib/api/movieDataSource.ts` - Data source completo
- `src/lib/api/tvDataSource.ts` - Data source de TV
- `src/lib/api/index.ts` - Module index

**Endpoints Mapeados:**
- ✅ `/movies/popular`
- ✅ `/movies/top-rated`
- ✅ `/movies/trending`
- ✅ `/movies/upcoming`
- ✅ `/movies/now-playing`
- ✅ `/movies/{id}`
- ✅ `/movies/{id}/credits`
- ✅ `/movies/{id}/videos`
- ✅ `/movies/{id}/similar`
- ✅ `/movies/{id}/providers`
- ✅ `/search`

**Formato:** Respostas do backend são mapeadas para o formato TMDB original → zero mudanças nos componentes Vue.

---

### 4. Integração de TV Shows (Frontend → Backend)

**Endpoints Mapeados:**
- ✅ `/tv/popular`
- ✅ `/tv/top-rated`
- ✅ `/tv/trending`
- ✅ `/tv/{id}`
- ✅ `/tv/{id}/season/{season}`
- ✅ `/tv/{id}/season/{season}/episodes/{episode}`
- ✅ `/tv/{id}/similar`

**Novos Endpoints no Backend:**
- ✅ `GET /api/v1/tv/{id}/season/{season_number}/episodes/{episode_number}`

---

### 5. Backend - Melhorias

**Arquivos Modificados:**
- `app/services/tv_service.py` - Adicionados métodos `get_episode()` e `get_season_episodes()`
- `app/api/v1/endpoints/tv.py` - Endpoint de episódio específico
- `app/schemas/tv.py` - Schema de Episode com `season_number`

**Já Existia:**
- ✅ TMDB fallback para filmes (movie_sync_service)
- ✅ Repositórios SQLAlchemy async
- ✅ JWT auth próprio
- ✅ Unit of Work pattern
- ✅ Cache Redis

---

### 6. Configuração de Ambiente

**Frontend:**
- ✅ `.env.local` com `VITE_API_URL=http://localhost:8000/api/v1`
- ✅ Axios instalado (`npm install axios`)

**Backend:**
- ✅ CORS configurado para `http://localhost:5173`
- ✅ `.env` com DATABASE_URL, SECRET_KEY, TMDB_API_KEY

---

### 7. Documentação

**Arquivos Criados:**
- ✅ `INTEGRACAO.md` - Guia completo de integração
- ✅ `STATUS.md` - Este arquivo

---

## ⏳ Pendente

### Alta Prioridade

1. **Watchlist & Favoritos (Frontend)**
   - Criar data sources para operações CRUD
   - Integrar com componentes existentes
   - Testar fluxo completo (adicionar/remover)

2. **Ratings/Reviews**
   - Backend: endpoints já existem?
   - Frontend: criar integration

3. **Histórico de Visualização**
   - Backend: implementar `POST /api/v1/history`
   - Frontend: criar integration

4. **Perfil de Usuário**
   - Backend: `PUT /api/v1/users/me` já existe?
   - Frontend: formulário de edição

---

### Média Prioridade

5. **Remoção de Código Legado**
   - Listar todos os usos de TMDB direto
   - Listar todos os usos de Supabase (exceto blog)
   - Criar plano de migração gradual

6. ** tratado no Frontend**
   - Loading states
   - Error boundaries
   - Toast notifications

7. **Validação de Fluxos**
   - [ ] Registro → Login → Browse
   - [ ] Search → Details → Add to Watchlist
   - [ ] Favorites management
   - [ ] Refresh token automático

---

### Baixa Prioridade

8. **Otimizações**
   - React Query / Vue Query para cache
   - Infinite scroll
   - Skeleton loaders

9. **Produção**
   - Dockerfile backend
   - docker-compose.yml
   - GitHub Actions
   - Deploy scripts

---

## 📋 Inventário de Endpoints

### Backend (FastAPI)

```
=== Health ===
GET  /health/live

=== Auth ===
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/verify
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

=== Users ===
GET  /api/v1/users/me
PUT  /api/v1/users/me
DELETE /api/v1/users/me

=== Movies ===
GET  /api/v1/movies
GET  /api/v1/movies/popular
GET  /api/v1/movies/top-rated
GET  /api/v1/movies/trending
GET  /api/v1/movies/upcoming
GET  /api/v1/movies/now-playing
GET  /api/v1/movies/{tmdb_id}
GET  /api/v1/movies/{id}/credits
GET  /api/v1/movies/{id}/videos
GET  /api/v1/movies/{id}/similar
GET  /api/v1/movies/{id}/providers

=== TV Shows ===
GET  /api/v1/tv
GET  /api/v1/tv/popular
GET  /api/v1/tv/top-rated
GET  /api/v1/tv/trending
GET  /api/v1/tv/{tmdb_id}
GET  /api/v1/tv/{id}/season/{season}
GET  /api/v1/tv/{id}/season/{s}/episodes/{e}
GET  /api/v1/tv/{id}/similar

=== Watchlist (Auth) ===
GET  /api/v1/watchlist
POST /api/v1/watchlist
DELETE /api/v1/watchlist/{id}

=== Favorites (Auth) ===
GET  /api/v1/favorites
POST /api/v1/favorites
DELETE /api/v1/favorites/{id}

=== Ratings (Auth) ===
GET  /api/v1/ratings
POST /api/v1/ratings
DELETE /api/v1/ratings/{id}

=== Search ===
GET  /api/v1/search?q=movie&type=movie&page=1
```

---

## 🔄 Próximos Passos Imediatos

1. **Testar integração localmente**
   ```bash
   # Terminal 1 - Backend
   cd C:\GitHub\apps\watch-next-backend
   .venv\Scripts\activate
   uvicorn app.main:app --reload

   # Terminal 2 - Frontend
   cd C:\GitHub\apps\watch-next-landing
   npm run dev
   ```

2. **Validar no browser:**
   - Abrir http://localhost:5173
   - Abrir DevTools → Network
   - Verificar requisições para `http://localhost:8000/api/v1/...`
   - Testar login
   - Testar listagem de filmes

3. **Corrigir issues encontradas**

4. **Implementar Watchlist/Favoritos no frontend**

---

## 📝 Notas Importantes

### Não Quebrado
- ✅ Componentes Vue existentes funcionam sem mudanças
- ✅ Mappers convertem backend → formato TMDB
- ✅ Repositórios e data sources mantêm interface compatível

### Código Legado Identificado

**Supabase:**
- `src/lib/supabase.ts` - Cliente legacy ( remover)
- `src/lib/supabase-storage.ts` - Storage ( remover)
- `src/composables/useAdminAuth.ts` - Substituir por `useAuth`
- `src/blog/provider/SupabaseBlogProvider.ts` - **MANTER** (blog usa Supabase)

**TMDB Direto:**
- `src/lib/tmdb/client.ts` - Usado por movieService.ts
- `src/lib/tmdb/services/movieService.ts` - 15+ métodos
- `src/lib/tmdb/datasources/movieDataSource.ts` - **SUBSTITUIR** por `src/lib/api/movieDataSource.ts`

### Migração Recomendada

**Não apague o código TMDB antigo ainda!**

1. Primeiro, use o novo `src/lib/api/movieDataSource.ts` em novos componentes
2. Teste extensivamente
3. Depois, migre componentes existentes gradualmente
4. Por fim, remova código legado

---

## ✅ Checklist Final de Integração

- [x] Cliente HTTP com JWT
- [x] Serviço de autenticação
- [x] Composable useAuth
- [x] Movie data source (backend)
- [x] TV data source (backend)
- [x] Environment config
- [x] CORS backend
- [x] Documentação
- [ ] Teste end-to-end
- [ ] Watchlist integration
- [ ] Favorites integration
- [ ] Profile page
- [ ] Legacy code cleanup