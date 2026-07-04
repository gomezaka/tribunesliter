# Tribunesliter v0.2.13

Nye anlegg kan legges til og vurderes med en gang.

Nytt i v0.2.13:

- Vurderinger publiseres direkte med navn/kallenavn.
- Nye haller/anlegg publiseres direkte fra appen og åpner vurderingsskjemaet etterpå.
- Moderatorpanelet brukes til ettersjekk og skjuling av synlige vurderinger.
- Humorbadges teller sjekk-ins, fasilitetsbidrag og nye anlegg lokalt på enheten.
- Supabase-policyer håndhever samme modell som klienten.

# Tribunesliter — tribune- og hallapp

Mobilvennlig PWA bygget med Vite + React + Supabase.

Målet er at folk skal kunne:

- lese seg opp på tribuneplasser, haller og utebaner
- se Tribunesliter-score og fasiliteter
- se pakkeliste for anlegget
- legge inn vurderinger
- legge til nye haller/anlegg og vurdere dem
- skjule upassende vurderinger etter publisering

Etter oppdatering må `docs/supabase-schema.sql` kjøres på nytt i Supabase, fordi RLS-policyen for direkte oppretting av anlegg er ny.

## Nytt i v0.2.6

- Lagrede haller/favoritter i egen bunnmenyvisning.
- Utforsk/kartvisning per kommune.
- Deling av hallprofil via mobilens delingsark eller clipboard.
- PWA-installasjonspanel på profilskjermen.
- Deploy-filer for Netlify og Vercel.

## Tidligere i v0.2.3

- Ekte ettersjekk i moderatorpanelet
- Vurderinger publiseres direkte
- Skjul allerede publiserte vurderinger i moderatorpanelet
- Godkjenn/avvis nye anleggsforslag
- Rediger navn, kommune, adresse, type og ute/inne før anlegg publiseres
- Strammere vurderingsskjema med egen fasilitetsrapport
- Fasilitetsrapport lagres i `facility_reports` og oppdaterer offentlig hallprofil direkte
- SQL-scriptet migrerer eldre v0.2/v0.2.1-tabeller trygt
- Fikset tidligere løs/duplisert `with check`-linje i SQL

## Filstruktur

```text
index.html
package.json
vite.config.js
.env.example
.gitignore
netlify.toml
vercel.json
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
  deploy-checklist.md
  beta-testplan.md
  mobil-installasjon.md
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

6. Gå til Authentication -> Providers -> Email i Supabase og slå av e-postbekreftelse / Confirm email. Appen bruker brukernavn + passord med en intern adresse som `brukernavn@tribunesliter.local`, så bekreftelsesmail kan ikke brukes.
7. Start appen på nytt:

```bash
npm run dev
```

## Første admin

Opprett en bruker i appen med brukernavn og passord, slik at Supabase oppretter en rad i `profiles`.

Hvis du fikk `email rate exceeded`, eller brukeren ble opprettet før e-postbekreftelse ble slått av, kan brukeren ligge i Auth som ubekreftet. Slå først av e-postbekreftelse under Authentication -> Providers -> Email. Slett deretter brukeren i Authentication -> Users og opprett den på nytt, eller bekreft brukeren manuelt i SQL:

```sql
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now()),
    updated_at = now()
where email = 'dittbrukernavn@tribunesliter.local';
```

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

Alle kan lese publisert innhold.

Alle kan sende inn direkte:

- `venues` med `status = approved`
- `reviews` med `status = approved`
- `facility_reports` med `status = approved`

Innloggede brukere kan sende inn:

- `venue_requests` med `status = pending`

Moderator/admin kan:

- avvise vurderinger med `rejected`
- skjule publiserte vurderinger med `hidden`
- skjule feil fasilitetsinfo ved å sette fasilitetsrapport til `rejected`
- arkivere feil eller dupliserte anlegg
- godkjenne/avvise eldre anleggsforslag som fortsatt ligger i kø

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
- moderator kan skjule/avvise feil fasilitetsinfo etter publisering
- nyeste publiserte fasilitetsrapport oppdaterer hallprofilen
- hallprofil viser anleggsinfo, kartlenke og når fasilitetsdata sist ble bekreftet
- vurderingsskjemaet fokuserer på tribune, sikt, klima/underlag, toalett, kiosk og parkering

Etter oppdatering må `docs/supabase-schema.sql` kjøres på nytt i Supabase, fordi `venue_public_cards` nå returnerer `facility_reported_at`.


## Østfold startdata

Denne versjonen inneholder `docs/supabase-seed-ostfold-v1.sql`.

Kjør filen i Supabase SQL Editor etter at hovedschemaet er kjørt. Den legger inn et første sett med godkjente haller/anlegg i Østfold uten å overskrive eksisterende rader. Fasilitetsdata legges ikke inn automatisk; de fylles inn av brukere via «Rett info».

## Fylkes-seeding

Kjør fylkene ett om gangen. Filene registrerer kun rader i `public.venues`.

Tilgjengelige fylkesfiler:

- `docs/supabase-seed-ostfold-v1.sql`
- `docs/supabase-seed-akershus-v1.sql`
- `docs/supabase-seed-oslo-v1.sql`
- `docs/supabase-seed-buskerud-v1.sql`


## Buskerud startdata

Denne versjonen inneholder `docs/supabase-seed-buskerud-v1.sql`.

Filen registrerer et første sett med godkjente haller/anlegg i Buskerud uten å overskrive eksisterende rader. Den legger ikke inn fasilitetsdata, vurderinger eller brukerlogger; dette skal fylles inn av brukere via «Rett info» og vurderinger.

Kontroll etter import:

```sql
select municipality, count(*)
from public.venues
where status = 'approved'
group by municipality
order by municipality;
```
