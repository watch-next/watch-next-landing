# watch-next-landing

Landing page for the Watch Next project.

## Environment Variables

This application depends on Supabase environment variables for the waitlist functionality to work in production.

### Required Variables

The following variables MUST be configured in Vercel (Project Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g., `https://your-project.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

### ⚠️ Production Warning

Without these variables configured:

- **Production (Vercel)**: The waitlist form will show an error: "Waitlist service not configured (missing environment variables)"
- **Development (localhost)**: The form runs in mock mode for testing

### How to Configure on Vercel

1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. **Redeploy** the application (variables are only applied at build time)

## Development

```bash
npm install
npm run dev
```

Local development works without Supabase credentials (mock mode), but you can set a `.env` file to test real integration:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
