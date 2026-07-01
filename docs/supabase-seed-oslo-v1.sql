-- Tribunesliter Oslo seed v1
-- Kjør i Supabase SQL Editor etter docs/supabase-schema.sql.
-- Prinsipp: Denne fylkesfilen registrerer kun godkjente anlegg/haller i public.venues.
-- Den legger IKKE inn vurderinger, fasilitetsrapporter, tribuneinfo eller komfortdata.
-- Brukerne skal selv logge tribune- og fasilitetsforhold i appen via «Rett info» og vurderinger.

with src(name, municipality, address, venue_type, sport_tags, cover_emoji, is_outdoor) as (
  values
    -- Oslo idrettshaller / flerbrukshaller
    ('Ammerud idrettshall', 'Oslo', 'Ammerudveien, 0958 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy','Badminton']::text[], '🏟️', false),
    ('Apalløkka idrettshall', 'Oslo', 'Tjernveien 10, 0957 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy','Badminton']::text[], '🏟️', false),
    ('Bentsebrua flerbrukshall', 'Oslo', 'Treschows gate 16, 0470 Oslo', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy','Badminton']::text[], '🏟️', false),
    ('Bestum idrettshall', 'Oslo', 'Holgerslystveien 18, 0280 Oslo', 'Idrettshall', array['Basket','Volleyball','Håndball','Badminton']::text[], '🏀', false),
    ('Bjølsenhallen', 'Oslo', 'Moldegata 7, 0468 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Bjørnholthallen', 'Oslo', 'Slimeveien 15, 1275 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Brynseng idrettshall', 'Oslo', 'Brynsengfaret 10, 0667 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Bølerhallen', 'Oslo', 'Utmarksveien, 0689 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Dælenenga flerbrukshall', 'Oslo', 'Falsens gate 21, 0556 Oslo', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy','Badminton']::text[], '🏟️', false),
    ('Ekeberg skoleidrettshall', 'Oslo', 'Stamhusveien 79, 1181 Oslo', 'Skoleidrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Ellingsrudhallen', 'Oslo', 'Karolinerveien 5, 1086 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Engebråten idrettshall', 'Oslo', 'Kapellveien 120, 0493 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Furusethallen', 'Oslo', 'Trygve Lies plass 1, 1051 Oslo', 'Idrettshall', array['Basket','Håndball','Volleyball','Innebandy']::text[], '🏀', false),
    ('Frydenberg idrettshall', 'Oslo', 'Frydenbergveien 48, 0575 Oslo', 'Idrettshall', array['Cheerleading','Håndball','Basket','Volleyball']::text[], '📣', false),
    ('Fyrstikkalleen flerbrukshall', 'Oslo', 'Fyrstikkalleen, 0661 Oslo', 'Flerbrukshall', array['Basket','Håndball','Volleyball','Innebandy']::text[], '🏀', false),
    ('Grefsen idrettshall', 'Oslo', 'Kapellveien 69, 0493 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Grorud flerbrukshus', 'Oslo', 'Grorudveien 7, 0962 Oslo', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Haugenstua idrettshall', 'Oslo', 'Fossumveien, 0988 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Haugerudhallen', 'Oslo', 'Tvetenveien 181, 0673 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Holmliahallen', 'Oslo', 'Nordåsveien 3, 1251 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Hovseterhallen', 'Oslo', 'Hovseterveien 32, 0768 Oslo', 'Idrettshall', array['Fekting','Håndball','Basket','Volleyball']::text[], '🤺', false),
    ('Høyenhallen', 'Oslo', 'Traktorveien, 0678 Oslo', 'Idrettshall', array['Innebandy','Håndball','Basket','Volleyball']::text[], '🏑', false),
    ('Jordalhallen', 'Oslo', 'Jordalgata 12, 0657 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Kastellet idrettshall', 'Oslo', 'Birger Olivers vei, 1176 Oslo', 'Idrettshall', array['Volleyball','Håndball','Basket','Innebandy']::text[], '🏐', false),
    ('Kjelsås idrettshall', 'Oslo', 'Midtoddveien 20C, 0494 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Klemetsrudhallen', 'Oslo', 'Lofsrudveien 6, 1281 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Korsvoll flerbrukshall', 'Oslo', null, 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Kringsjåhallen', 'Oslo', 'Sognsveien 210C, 0863 Oslo', 'Idrettshall', array['Volleyball','Håndball','Basket','Innebandy']::text[], '🏐', false),
    ('Lambertseter idrettshall', 'Oslo', 'Lambertseter stadion, 1153 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Leirskallen turnhall', 'Oslo', 'Leirskallen 2, 1164 Oslo', 'Turnhall', array['Turn']::text[], '🤸', false),
    ('Linderudhallen', 'Oslo', 'Statsråd Mathiesens vei 2, 0594 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Majorstuen flerbrukshall', 'Oslo', 'Middelthuns gate 26, 0368 Oslo', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Marienlyst idrettshall', 'Oslo', 'Suhms gate, 0362 Oslo', 'Idrettshall', array['Basket','Håndball','Volleyball','Innebandy']::text[], '🏀', false),
    ('Nydalen idrettshall', 'Oslo', 'Nydalsveien 30C, 0484 Oslo', 'Idrettshall', array['Volleyball','Håndball','Basket','Innebandy']::text[], '🏐', false),
    ('Nordbyen turn- og idrettshall', 'Oslo', 'Haavard Martinsens vei 30, 0978 Oslo', 'Turn- og idrettshall', array['Turn','Håndball','Basket','Volleyball']::text[], '🤸', false),
    ('Oppsal Arena 1-3', 'Oslo', 'Vetlandsveien 49, 0685 Oslo', 'Arena', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Oppsal Arena 4', 'Oslo', 'Vetlandsveien 49, 0685 Oslo', 'Arena', array['Basket','Håndball','Volleyball','Innebandy']::text[], '🏀', false),
    ('Persbråten idrettshall', 'Oslo', 'Gamle Hovsetervei 1, 0768 Oslo', 'Idrettshall', array['Basket','Håndball','Volleyball','Innebandy']::text[], '🏀', false),
    ('Rommen idrettshall', 'Oslo', 'Karen Platous vei 31, 0988 Oslo', 'Idrettshall', array['Innebandy','Håndball','Basket','Volleyball']::text[], '🏑', false),
    ('Romsåshallen', 'Oslo', 'Odvar Solbergs vei, 0973 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Skøyenhallen', 'Oslo', 'Monolittveien, 0273 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Stovnerhallen', 'Oslo', 'Karl Fossums vei, 0984 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Teglverket idrettshall', 'Oslo', 'Grenseveien 60, 0579 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Tokerud flerbrukshall', 'Oslo', 'Inga Bjørnsons vei 1B, 0986 Oslo', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Tøyenbadet flerbrukshall', 'Oslo', 'Helgesens gate 90, 0563 Oslo', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy','Svømming']::text[], '🏟️', false),
    ('Tåsen idrettshall', 'Oslo', 'Nordbergveien 15, 0875 Oslo', 'Idrettshall', array['Volleyball','Håndball','Basket','Innebandy']::text[], '🏐', false),
    ('Ullern flerbrukshall', 'Oslo', 'Myntfunnveien, 0382 Oslo', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Ullern videregående skole idrettshall', 'Oslo', null, 'Skoleidrettshall', array['Basket','Håndball','Volleyball','Innebandy']::text[], '🏀', false),
    ('Uranienborg idrettshall', 'Oslo', 'Briskebyveien 7, 0259 Oslo', 'Idrettshall', array['Turn','Håndball','Basket','Volleyball']::text[], '🤸', false),
    ('Vahl idrettshall', 'Oslo', 'Vahls gate 4, 0187 Oslo', 'Idrettshall', array['Basket','Håndball','Volleyball','Innebandy']::text[], '🏀', false),
    ('Valle Hovin videregående skole idrettshall', 'Oslo', 'Innspurten 16C, 0663 Oslo', 'Skoleidrettshall', array['Fotball','Håndball','Basket','Volleyball']::text[], '⚽', false),
    ('Vestli flerbrukshall', 'Oslo', 'Vestlisvingen 18, 0986 Oslo', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Veitvethallen', 'Oslo', 'Veitvetveien 29, 0596 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Voksen idrettshall', 'Oslo', 'Jarbakken 1, 0767 Oslo', 'Idrettshall', array['Badminton','Basket','Håndball','Innebandy','Volleyball']::text[], '🏟️', false),
    ('Øraker idrettshall', 'Oslo', 'Lilleakerveien 60, 0284 Oslo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy','Badminton']::text[], '🏟️', false),

    -- Private / lagseide / større idrettshaller i Oslo
    ('Blindern Athletica', 'Oslo', null, 'Idrettssenter', array['Trening','Basket','Volleyball','Badminton']::text[], '🏋️', false),
    ('Bygdøhus', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Aktivitet']::text[], '🏟️', false),
    ('Bækkelagshallen', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Domus Athletica', 'Oslo', null, 'Idrettssenter', array['Trening','Basket','Volleyball','Badminton']::text[], '🏋️', false),
    ('Ekeberg idrettshall', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Furuset Forum', 'Oslo', 'Søren Bulls vei 4, 1051 Oslo', 'Arena', array['Ishockey','Håndball','Basket','Volleyball','Arrangement']::text[], '🏒', false),
    ('KFUM-hallen', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Fotball']::text[], '⚽', false),
    ('Løren idrettshall', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('LF-hallen', 'Oslo', null, 'Idrettshall', array['Fotball','Håndball','Basket','Volleyball']::text[], '⚽', false),
    ('Njårdhallen', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Tennis']::text[], '🏟️', false),
    ('Norges idrettshøgskole idrettshall', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Trening']::text[], '🏟️', false),
    ('Nordstrandshallen', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Prinsdalshallen', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Voldsløkka idrettshall', 'Oslo', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),

    -- Ishaller / arenaer / bad som ofte brukes ved arrangement
    ('Jordal Amfi', 'Oslo', null, 'Ishall', array['Ishockey','Skøyter','Arrangement']::text[], '🏒', false),
    ('Bøler bad', 'Oslo', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Furuset bad', 'Oslo', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Holmlia bad', 'Oslo', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Manglerud bad', 'Oslo', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Romsås bad', 'Oslo', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Tøyenbadet', 'Oslo', 'Helgesens gate 90, 0563 Oslo', 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Økern bad', 'Oslo', null, 'Svømmehall', array['Svømming']::text[], '🏊', false)

), updated as (
  update public.venues v
  set
    address = coalesce(src.address, v.address),
    venue_type = src.venue_type,
    sport_tags = src.sport_tags,
    cover_emoji = src.cover_emoji,
    is_outdoor = src.is_outdoor,
    status = 'approved',
    updated_at = now()
  from src
  where lower(v.name) = lower(src.name)
    and lower(v.municipality) = lower(src.municipality)
  returning v.id
)
insert into public.venues (name, municipality, address, venue_type, sport_tags, cover_emoji, is_outdoor, status)
select src.name, src.municipality, src.address, src.venue_type, src.sport_tags, src.cover_emoji, src.is_outdoor, 'approved'
from src
where not exists (
  select 1
  from public.venues v
  where lower(v.name) = lower(src.name)
    and lower(v.municipality) = lower(src.municipality)
);

-- Kontroll etter import:
-- select municipality, count(*) from public.venues where status = 'approved' group by municipality order by municipality;
-- select name, municipality, address, venue_type from public.venues where status = 'approved' and municipality = 'Oslo' order by name;
