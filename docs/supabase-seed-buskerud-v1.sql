-- Tribunesliter Buskerud seed v1
-- Kjør i Supabase SQL Editor etter docs/supabase-schema.sql.
-- Prinsipp: Denne fylkesfilen registrerer kun godkjente anlegg/haller i public.venues.
-- Den legger IKKE inn vurderinger, fasilitetsrapporter, tribuneinfo eller komfortdata.
-- Brukerne skal selv logge tribune- og fasilitetsforhold i appen via «Rett info» og vurderinger.
-- Merk: Adresser er bare utfylt der de er sikkert hentet/standardisert. Ellers settes address = null.

with src(name, municipality, address, venue_type, sport_tags, cover_emoji, is_outdoor) as (
  values
    ('Drammenshallen', 'Drammen', 'Knoffs gate 18, 3044 Drammen', 'Arena', array['Håndball','Basket','Volleyball','Innebandy','Arrangement']::text[], '🏟️', false),
    ('Berskaughallen', 'Drammen', null, 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Gulskogen idrettshall', 'Drammen', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Konnerudhallen', 'Drammen', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Ekneshallen', 'Drammen', null, 'Idrettshall', array['Innebandy','Håndball','Basket','Volleyball']::text[], '🏑', false),
    ('Mjøndalshallen', 'Drammen', null, 'Idrettshall', array['Innebandy','Håndball','Basket','Volleyball']::text[], '🏑', false),
    ('Skogerhallen', 'Drammen', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Solberghallen', 'Drammen', null, 'Idrettshall', array['Innebandy','Håndball','Basket','Volleyball']::text[], '🏑', false),
    ('Strømmhallen', 'Drammen', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Øren idrettshall', 'Drammen', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Åssidenhallen', 'Drammen', null, 'Flerbrukshall', array['Innebandy','Håndball','Basket','Volleyball']::text[], '🏑', false),
    ('Svelvikhallen', 'Drammen', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Drammensbadet', 'Drammen', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Marienlyst stadion', 'Drammen', null, 'Stadion', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Mjøndalen stadion', 'Drammen', null, 'Stadion', array['Fotball']::text[], '⚽', true),
    ('Kongsberg Idretts- og svømmehall', 'Kongsberg', null, 'Idretts- og svømmehall', array['Håndball','Basket','Volleyball','Svømming']::text[], '🏟️', false),
    ('Kongsberg idrettspark', 'Kongsberg', null, 'Idrettspark', array['Fotball','Friidrett','Arrangement']::text[], '⚽', true),
    ('Skrimhallen', 'Kongsberg', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Raumyrhallen', 'Kongsberg', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Hvittingfoss idrettshall', 'Kongsberg', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Kongsberg Tennishall', 'Kongsberg', null, 'Tennishall', array['Tennis']::text[], '🎾', false),
    ('Hønefoss Arena', 'Ringerike', null, 'Flerbrukshall', array['Håndball','Klatring','Turn','Friidrett','Basket','Volleyball']::text[], '🏟️', false),
    ('Ringerikshallen', 'Ringerike', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Hovhallen', 'Ringerike', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Ullerålhallen', 'Ringerike', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Benterudhallen', 'Ringerike', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Haugsbygd Arena', 'Ringerike', null, 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Tyristrandhallen', 'Ringerike', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Veienmarka gymsal', 'Ringerike', null, 'Gymsal', array['Aktivitet','Basket','Volleyball']::text[], '🏟️', false),
    ('Schjongshallen', 'Ringerike', null, 'Ishall', array['Ishockey','Skøyter']::text[], '🏒', false),
    ('AKA Arena', 'Ringerike', null, 'Stadion', array['Fotball']::text[], '⚽', true),
    ('Hønefoss stadion', 'Ringerike', null, 'Stadion', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Ringeriksbadet', 'Hole', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Kleivhallen', 'Hole', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Hole ungdomsskole idrettshall', 'Hole', null, 'Skoleidrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Modumhallen', 'Modum', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Vikersundhallen', 'Modum', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Vikersund skole og flerbrukshall', 'Modum', null, 'Flerbrukshall', array['Håndball','Basket','Volleyball','Turn','Friidrett']::text[], '🏟️', false),
    ('Åmot svømmehall', 'Modum', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Furumo idrettspark', 'Modum', null, 'Idrettspark', array['Fotball','Friidrett','Skøyter']::text[], '⚽', true),
    ('Vikersund Hoppsenter', 'Modum', null, 'Skianlegg', array['Hopp','Arrangement']::text[], '🎿', true),
    ('Hokksund Barneskole Flerbrukshall', 'Øvre Eiker', 'Lyngveien 50, 3300 Hokksund', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Sentrumshallen', 'Øvre Eiker', 'Rådhusgata 12, 3300 Hokksund', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Skotselv flerbrukshall', 'Øvre Eiker', 'Dalerveien 12, 3330 Skotselv', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Vestfossen flerbrukshall', 'Øvre Eiker', 'Skolegata 10, 3320 Vestfossen', 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Hokksundhallen', 'Øvre Eiker', null, 'Flerbrukshall', array['Turn','Cheerleading','Kampsport','Håndball','Basket','Volleyball']::text[], '🤸', false),
    ('Nye Hokksund svømmehall', 'Øvre Eiker', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Vestfossen folkebad', 'Øvre Eiker', 'Skolegata, 3320 Vestfossen', 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Loesmoen idrettspark', 'Øvre Eiker', null, 'Idrettspark', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Lierhallen', 'Lier', null, 'Idretts- og svømmehall', array['Håndball','Basket','Volleyball','Svømming']::text[], '🏟️', false),
    ('Reistad Arena', 'Lier', null, 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Syllinghallen', 'Lier', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Hegg skole idrettshall', 'Lier', null, 'Skoleidrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Lier stadion', 'Lier', null, 'Stadion', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Flå idrettshall', 'Flå', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Flå svømmehall', 'Flå', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Nesbyen idrettshall', 'Nesbyen', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Nesbyen stadion', 'Nesbyen', null, 'Stadion', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Gol Idrettsarena', 'Gol', 'Tronderudvegen 1A, 3550 Gol', 'Flerbrukshall', array['Håndball','Fotball','Basket','Klatring','Turn','Innebandy']::text[], '🏟️', false),
    ('Hallingmo idrettspark', 'Gol', null, 'Idrettspark', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Trøimshallen', 'Hemsedal', null, 'Idrettshall', array['Volleyball','Fotball','Karate','Aktivitet']::text[], '🏟️', false),
    ('Hemsedal idrettsplass', 'Hemsedal', null, 'Idrettspark', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Ål idrettshall', 'Ål', 'Sundrevegen 40, 3570 Ål', 'Idrettshall', array['Håndball','Volleyball','Fotball','Klatring','Aerobic']::text[], '🏟️', false),
    ('Ål stadion', 'Ål', null, 'Stadion', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Geilohallen', 'Hol', 'Lienvegen 85, 3580 Geilo', 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Geilo idrettsplass', 'Hol', null, 'Idrettspark', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Sigdalshallen', 'Sigdal', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Prestfoss samfunnshus', 'Sigdal', null, 'Samfunnshus/aktivitetshall', array['Aktivitet','Volleyball','Basket']::text[], '🏟️', false),
    ('Eggedal samfunnshus', 'Sigdal', null, 'Samfunnshus/aktivitetshall', array['Aktivitet','Volleyball','Basket']::text[], '🏟️', false),
    ('Krødsheradhallen', 'Krødsherad', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Noresund idrettsplass', 'Krødsherad', null, 'Idrettspark', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Skattekista', 'Flesberg', 'Stevningsmogen, 3623 Lampeland', 'Flerbrukshall', array['Håndball','Svømming','Trening','Basket','Volleyball']::text[], '🏟️', false),
    ('Stevningsmogen fritidspark', 'Flesberg', 'Stevningsmogen, 3623 Lampeland', 'Idrettspark', array['Fotball','Sandvolleyball','Tennis','Friidrett','Ski']::text[], '⚽', true),
    ('Rollag flerbrukshall', 'Rollag', null, 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Veggli flerbrukshall', 'Rollag', null, 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Rødberghallen', 'Nore og Uvdal', null, 'Idrettshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Uvdal flerbrukshall', 'Nore og Uvdal', null, 'Flerbrukshall', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Rødberg idrettspark', 'Nore og Uvdal', null, 'Idrettspark', array['Fotball','Friidrett']::text[], '⚽', true)
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
-- select name, municipality, address, venue_type from public.venues where status = 'approved' and municipality in ('Drammen','Kongsberg','Ringerike','Hole','Modum','Øvre Eiker','Lier','Flå','Nesbyen','Gol','Hemsedal','Ål','Hol','Sigdal','Krødsherad','Flesberg','Rollag','Nore og Uvdal') order by municipality, name;
