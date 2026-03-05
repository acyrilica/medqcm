import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 7** — Press **Ctrl + S** to save

---

That's it! Your folder structure should now look like:
```
monqcm/
├── app/
├── lib/
│   └── supabase.ts   ← ✅ just created
├── .env.local
└── package.json
