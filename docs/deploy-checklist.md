# Deploy-sjekkliste for Tribunesliter

## Før deploy

1. Kontroller at `.env.local` finnes lokalt og at Supabase-nøklene fungerer.
2. Kjør:

```bash
npm install
npm run check
npm run build
```

3. Kontroller i Supabase at Authentication -> Providers -> Email ikke krever e-postbekreftelse / Confirm email. Brukernavn-flyten bruker interne adresser som `brukernavn@tribunesliter.local`.
4. Åpne `dist/` via `npm run preview` og test:
   - forside
   - hallprofil
   - opprett bruker med brukernavn/passord
   - innlogging med brukernavn/passord
   - vurdering publiseres direkte
   - skjul synlig vurdering i moderatorpanelet
   - rett-info publiseres direkte
   - lagre/fjerne hall
   - del-knapp
   - admin/moderering

## Netlify

Build command:

```bash
npm run build
```

Publish directory:

```text
dist
```

Legg inn miljøvariabler i Netlify:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`netlify.toml` ligger allerede i prosjektet.

## Vercel

Framework preset: Vite

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Legg inn miljøvariabler i Vercel:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

`vercel.json` ligger allerede i prosjektet.

## Etter deploy

1. Åpne produksjonslenken på mobil.
2. Opprett/logg inn med brukernavn og passord.
3. Send inn testvurdering.
4. Sjekk at vurderingen vises for andre enheter.
5. Skjul testvurderingen i moderatorpanelet.
6. Legg appen til på hjemskjermen.
7. Test at appikon og fullskjerm fungerer.
