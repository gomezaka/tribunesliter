# Tribunesliter v2.4

Designoppdatering basert på handoffen **Tribunesliter Sporty**. Denne versjonen er en ren frontend-/PWA-oppdatering og krever ingen ny SQL-kjøring hvis du allerede kjører v2.3.

Nytt i v2.4:

- Nytt mobil-først designsystem med Archivo/Manrope, grønne CTA-er, amber score/rumpe-elementer og renere kort.
- Appaktig bunnmeny med fem punkter og midtstilt FAB for bidrag/vurdering.
- Redesignet forside med stor appoverskrift, søk, filterchips, sortering og nye hallkort.
- Hallprofil med score-ring, putealarm, delscorekort, bedre fasilitetsliste, pakkeliste og sticky handlinger.
- Ny vurderingsflyt med Rumpe-o-meter, terningkast-knapper, raske kommentar-tags og bedre mobilskjema.
- Ny Rett info-flyt med tydelig skille mellom offisiell info og brukerforslag.
- Mer skannbart moderatorpanel med stat-piller og modereringskort.
- Nye empty/loading/success-states med samme visuelle språk.

# Tribunesliter — tribune- og hallapp

Mobilvennlig PWA bygget med Vite + React + Supabase.

Målet er at folk skal kunne:

- lese seg opp på tribuneplasser, haller og utebaner
- se Tribunesliter-score og fasiliteter
- se pakkeliste for anlegget
- legge inn vurderinger
- foreslå nye haller/anlegg
- moderere innsendinger før de vises offentlig

## Nytt i v0.2.3

- Ekte modereringsflyt i appen
- Godkjenn/avvis ventende vurderinger
- Skjul allerede publiserte vurderinger
- Godkjenn/avvis nye anleggsforslag
- Rediger navn, kommune, adresse, type og ute/inne før anlegg publiseres
- Strammere vurderingsskjema med egen fasilitetsrapport
- Fasilitetsrapport lagres i `facility_reports` og kan brukes til offentlig hallprofil etter godkjenning
- SQL-scriptet migrerer eldre v0.2/v0.2.1-tabeller trygt
- Fikset tidligere løs/duplisert `with check`-linje i SQL

## Filstruktur

```text
index.html
package.json
vite.config.js
.env.example
public/
  icon.svg
  manifest.webmanifest
  sw.js
src/
  main.jsx
  App.jsx
  styles.css
  lib/
    api.js
    demoData.js
    supabase.js
docs/
  supabase-schema.sql
scripts/
  check-source.mjs
```

## Kjør lokalt

Installer avhengigheter:

```bash
npm install
```

Start utviklingsserver:

```bash
npm run dev
```

Åpne:

```text
http://localhost:5173
```

## Koble til Supabase

1. Opprett et nytt Supabase-prosjekt.
2. Åpne SQL Editor.
3. Kjør hele filen:

```text
docs/supabase-schema.sql
```

4. Kopier `.env.example` til `.env.local`.
5. Fyll inn:

```env
VITE_SUPABASE_URL=https://din-prosjektref.supabase.co
VITE_SUPABASE_ANON_KEY=din-public-anon-key
VITE_APP_URL=http://localhost:5173
```

6. Start appen på nytt:

```bash
npm run dev
```

## Første admin

Logg inn én gang med e-post i appen, slik at Supabase oppretter en rad i `profiles`.

Kjør deretter i Supabase SQL Editor:

```sql
select id, email from auth.users order by created_at desc;
```

Finn din bruker-ID og kjør:

```sql
update public.profiles
set role = 'admin'
where id = '<DIN-BRUKER-UUID>';
```

Etterpå logger du ut og inn igjen, eller oppdaterer siden. Profilen skal da vise rollen `admin`, og knappen **Åpne moderering** blir tilgjengelig.

## Datamodell

Alle kan lese godkjent innhold.

Innloggede brukere kan sende inn:

- `reviews` med `status = pending`
- `facility_reports` med `status = pending`
- `venue_requests` med `status = pending`

Moderator/admin kan:

- sette vurderinger til `approved`
- avvise vurderinger med `rejected`
- skjule publiserte vurderinger med `hidden`
- godkjenne anleggsforslag og opprette offentlig hall i `venues`
- avvise anleggsforslag

## Bygg for publisering

```bash
npm run build
```

Resultatet havner i:

```text
dist/
```

Denne mappen kan hostes på Netlify, Vercel, Cloudflare Pages eller vanlig webhotell.


## v0.2.3

Denne versjonen gjør appen mer klar for ekte betatest:

- bedre søk, kommune-/idrettsfilter og sortering
- egen visning for å rapportere feil/oppdatert fasilitetsinfo
- moderator kan godkjenne/avvise fasilitetsrapporter
- godkjent fasilitetsrapport oppdaterer hallprofilen
- hallprofil viser anleggsinfo, kartlenke og når fasilitetsdata sist ble bekreftet
- vurderingsskjemaet inkluderer garderobe og dusj

Etter oppdatering må `docs/supabase-schema.sql` kjøres på nytt i Supabase, fordi `venue_public_cards` nå returnerer `facility_reported_at`.
