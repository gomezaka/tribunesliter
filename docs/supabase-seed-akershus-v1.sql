-- Tribunesliter Akershus seed v1
-- Kjør i Supabase SQL Editor etter docs/supabase-schema.sql.
-- Prinsipp: Denne fylkesfilen registrerer kun godkjente anlegg/haller.
-- Den legger IKKE inn vurderinger, fasilitetsrapporter, tribuneinfo eller komfortdata.
-- Brukerne skal selv logge tribune- og fasilitetsforhold i appen via «Rett info» og vurderinger.

with src(name, municipality, address, venue_type, sport_tags, cover_emoji, is_outdoor) as (

  values
    -- Asker
    ('Askerhallen', 'Asker', null, 'Ishall', array['Ishockey','Skøyter']::text[], '🏒', false),
    ('Leikvollhallen', 'Asker', null, 'Idrettshall', array['Håndball','Volleyball','Basket','Innebandy']::text[], '🏟️', false),
    ('Heggedal idrettshall', 'Asker', null, 'Idrettshall', array['Håndball','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Holmenhallen', 'Asker', null, 'Idrettshall', array['Håndball','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Risenga idrettshall', 'Asker', null, 'Idrettshall', array['Håndball','Basket','Volleyball']::text[], '🏀', false),
    ('Vollen idrettshall', 'Asker', null, 'Idrettshall', array['Håndball','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Røykenhallen', 'Asker', null, 'Idrettshall', array['Håndball','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Hurumhallen', 'Asker', null, 'Idrettshall', array['Håndball','Volleyball','Innebandy']::text[], '🏟️', false),

    -- Bærum
    ('Anna Krefting skole idrettshall', 'Bærum', 'Grorudenga 1, 1350 Lommedalen', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Bærum idrettspark', 'Bærum', 'Hauger skolevei 36, 1351 Rud', 'Idrettspark', array['Friidrett','Svømming','Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Combihallen', 'Bærum', 'Nedre Åsvei 1, 1341 Slependen', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Eikelihallen', 'Bærum', 'Bispeveien 10, 1362 Hosle', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Emma Hjort skole idrettshall', 'Bærum', 'Tokes vei 50, 1336 Sandvika', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Evje skole idrettshall', 'Bærum', 'Evjebakken 20, 1346 Gjettum', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Haslumhallen', 'Bærum', 'Gjønnesjordet 36, 1357 Bekkestua', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Helsethallen', 'Bærum', 'Skollerudveien 5, 1353 Bærums Verk', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Hoslehallen', 'Bærum', 'Bjarne Skaus vei 40, 1362 Hosle', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Hundsundhallen', 'Bærum', 'Snarøyveien 81, 1364 Fornebu', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Høvik skole idrettshall', 'Bærum', 'Gamle Drammensvei 119, 1363 Høvik', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Levre skole idrettshall', 'Bærum', 'Levre skolevei 6, 1346 Gjettum', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Lommedalshallen', 'Bærum', 'Skolegata 30, 1350 Lommedalen', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Nadderud Arena', 'Bærum', 'Haukeveien 11, 1357 Bekkestua', 'Arena', array['Håndball','Basket','Volleyball','Innebandy']::text[], '🏀', false),
    ('Nadderudhallen', 'Bærum', 'Haukeveien 12, 1357 Bekkestua', 'Idrettshall', array['Håndball','Basket','Volleyball']::text[], '🏟️', false),
    ('Oksenøya skole idrettshall', 'Bærum', 'Forneburingen 78, 1364 Fornebu', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Ringstabekk skole idrettshall', 'Bærum', 'Peiks vei 1, 1356 Bekkestua', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Rykkinnhallene', 'Bærum', 'Lerdueveien 73, 1349 Rykkinn', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Storøya skole idrettshall', 'Bærum', 'Forneburingen 300, 1364 Fornebu', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),

    -- Lillestrøm
    ('Romerike friidrettstadion', 'Lillestrøm', 'Leiraveien 2, 2000 Lillestrøm', 'Friidrettsstadion', array['Friidrett']::text[], '🏃', true),
    ('Skedsmohallen', 'Lillestrøm', 'Leiraveien 2, 2000 Lillestrøm', 'Fleridrettshall', array['Håndball','Friidrett','Basket','Volleyball','Kampsport']::text[], '🏟️', false),
    ('Skjettenhallen', 'Lillestrøm', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Slorahallen', 'Lillestrøm', null, 'Idrettshall', array['Håndball','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Tærud fjellhall', 'Lillestrøm', null, 'Idrettshall', array['Håndball','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Tærudhallen', 'Lillestrøm', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Vollahallen', 'Lillestrøm', null, 'Idrettshall', array['Håndball','Basket','Volleyball']::text[], '🏀', false),
    ('Frogner idrettspark - Trippel flerbrukshall', 'Lillestrøm', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket','Innebandy']::text[], '🏟️', false),
    ('Eika Fet Arena', 'Lillestrøm', null, 'Arena', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Bingsfosshallen', 'Lillestrøm', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),

    -- Lørenskog
    ('Benterudhallen', 'Lørenskog', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Fjellhamar arena', 'Lørenskog', 'Marcus Thranes vei 98, 1472 Fjellhamar', 'Arena', array['Håndball','Klatring','Volleyball','Basket']::text[], '🧗', false),
    ('Fjellhamarhallen', 'Lørenskog', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Kjennhallen', 'Lørenskog', null, 'Idrettshall', array['Håndball','Klatring','Volleyball']::text[], '🧗', false),
    ('Kjenn turnhall', 'Lørenskog', 'Mailandveien 22, 1473 Lørenskog', 'Turnhall', array['Turn']::text[], '🤸', false),
    ('Lørenskoghallen', 'Lørenskog', 'Sykehusveien 13, 1474 Lørenskog', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Skårerhallen', 'Lørenskog', 'Nordlifaret 50, 1473 Lørenskog', 'Idrettshall', array['Håndball','Svømming','Bryting']::text[], '🏟️', false),
    ('Thonhallen', 'Lørenskog', 'Skårersletta 69, 1473 Lørenskog', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),

    -- Rælingen
    ('Marikollhallen', 'Rælingen', 'Tangerudvegen 1, 2008 Fjerdingby', 'Idrettshall', array['Håndball','Klatring','Volleyball','Basket']::text[], '🧗', false),
    ('Sandbekkhallen', 'Rælingen', 'Blystadvegen 10, 2006 Løvenstad', 'Flerbrukshall', array['Håndball','Svømming','Volleyball','Basket']::text[], '🏟️', false),
    ('Fjerdingbyhallen', 'Rælingen', null, 'Idrettshall', array['Basket','Volleyball','Håndball']::text[], '🏀', false),

    -- Nordre Follo
    ('Skihallen', 'Nordre Follo', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Ski Alliansehall', 'Nordre Follo', null, 'Flerbrukshall', array['Håndball','Klatring','Dans']::text[], '🧗', false),
    ('Ski ishall', 'Nordre Follo', null, 'Ishall', array['Ishockey','Skøyter']::text[], '🏒', false),
    ('Ski turnhall', 'Nordre Follo', null, 'Turnhall', array['Turn']::text[], '🤸', false),
    ('Langhushallen', 'Nordre Follo', 'Møllerenga 6, 1405 Langhus', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Siggerudhallen', 'Nordre Follo', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Kråkstadhallen', 'Nordre Follo', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Stil Arena', 'Nordre Follo', null, 'Arena', array['Håndball','Volleyball','Basket','Innebandy']::text[], '🏟️', false),
    ('Sofiemyrhallen', 'Nordre Follo', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Østre Greverud idrettshall', 'Nordre Follo', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Greverudhallen', 'Nordre Follo', null, 'Idrettshall', array['Håndball','Volleyball','Basket','Badminton','Turn']::text[], '🏟️', false),
    ('Kolbotn skole flerbrukshall', 'Nordre Follo', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Finstadhallen', 'Nordre Follo', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket','Innebandy']::text[], '🏟️', false),
    ('Kråkstad bad', 'Nordre Follo', 'Skolebakken 1B, 1408 Kråkstad', 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Langhusbadet', 'Nordre Follo', 'Berghagan 6A, 1405 Langhus', 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Sofiemyr svømmehall', 'Nordre Follo', 'Holbergs vei 39, 1412 Sofiemyr', 'Svømmehall', array['Svømming']::text[], '🏊', false),

    -- Ås
    ('Åshallen', 'Ås', 'Gamle Hogstvetvei 3, 1435 Ås', 'Flerbrukshall', array['Håndball','Friidrett','Turn','Dans','Volleyball','Basket']::text[], '🏟️', false),
    ('Nordbyhallen', 'Ås', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Rustad flerbrukshall', 'Ås', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Solberg flerbrukshall', 'Ås', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Åsgård flerbrukshall', 'Ås', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Ås svømmehall', 'Ås', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Nordby svømmehall', 'Ås', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),

    -- Frogn
    ('Frognhallen', 'Frogn', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Dyrløkkehallen', 'Frogn', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Frogn Arena', 'Frogn', null, 'Arena', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Bølgen bad & aktivitetssenter', 'Frogn', 'Belsjøveien 2, 1440 Drøbak', 'Svømmehall', array['Svømming']::text[], '🏊', false),
    ('Seiersten stadion', 'Frogn', 'Belsjøveien 2, 1443 Drøbak', 'Stadion', array['Fotball','Friidrett']::text[], '⚽', true),

    -- Vestby
    ('Vestby Arena', 'Vestby', null, 'Arena', array['Håndball','Volleyball','Basket','Innebandy','Badminton']::text[], '🏟️', false),
    ('Vestbyhallen', 'Vestby', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Grevlingen flerbrukshall', 'Vestby', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket','Svømming']::text[], '🏟️', false),

    -- Nesodden
    ('Nesoddenhallen', 'Nesodden', 'Kjartan Veldes vei 12, 1450 Nesoddtangen', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),

    -- Ullensaker
    ('Jessheim is- og flerbrukshall', 'Ullensaker', null, 'Ishall/flerbrukshall', array['Ishockey','Skøyter','Håndball','Volleyball']::text[], '🏒', false),
    ('Jessheimhallen', 'Ullensaker', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Alfhallen', 'Ullensaker', null, 'Idrettshall', array['Friidrett','Håndball','Volleyball']::text[], '🏃', false),
    ('Gystadmarka flerbrukshall', 'Ullensaker', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket','Innebandy']::text[], '🏟️', false),
    ('Mogreina idrettshall', 'Ullensaker', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),

    -- Eidsvoll
    ('Eidsvollhallen', 'Eidsvoll', 'Jon Sørensens veg 2, 2080 Eidsvoll', 'Idrettshall', array['Håndball','Svømming','Volleyball','Basket']::text[], '🏟️', false),
    ('Råholthallen', 'Eidsvoll', 'Tærudvegen 1, 2070 Råholt', 'Idrettshall', array['Håndball','Friidrett','Volleyball','Basket']::text[], '🏟️', false),
    ('Langsethallen', 'Eidsvoll', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Vilberghallen', 'Eidsvoll', null, 'Idrettshall', array['Basket','Håndball','Volleyball']::text[], '🏀', false),
    ('Råholt Bad', 'Eidsvoll', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),

    -- Nes
    ('Neshallen', 'Nes', null, 'Idrettshall', array['Håndball','Basket','Volleyball']::text[], '🏟️', false),
    ('Neskollenhallen', 'Nes', null, 'Idrettshall', array['Håndball','Basket','Volleyball']::text[], '🏟️', false),
    ('Vormsundhallen', 'Nes', null, 'Idrettshall', array['Håndball','Basket','Volleyball']::text[], '🏟️', false),
    ('Nes svømmehall', 'Nes', 'Rådhusgata 2, 2150 Årnes', 'Svømmehall', array['Svømming']::text[], '🏊', false),

    -- Nannestad
    ('Nannestadhallen', 'Nannestad', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Maurahallen', 'Nannestad', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Nannestad svømmehall', 'Nannestad', null, 'Svømmehall', array['Svømming']::text[], '🏊', false),

    -- Aurskog-Høland
    ('Aurskoghallen', 'Aurskog-Høland', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Aursmoen Idrettspark', 'Aurskog-Høland', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket','Trening']::text[], '🏟️', false),
    ('Bjørkelangen sportshall', 'Aurskog-Høland', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Søndrehallen', 'Aurskog-Høland', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Setskog oppvekstsenter samfunnshall', 'Aurskog-Høland', null, 'Samfunnshall', array['Håndball','Volleyball','Aktivitet']::text[], '🏟️', false),

    -- Enebakk
    ('Enebakkhallen', 'Enebakk', null, 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Flatebyhallen', 'Enebakk', null, 'Flerbrukshall', array['Fotball','Håndball','Basket','Innebandy']::text[], '🏟️', false),
    ('Mjærhallen', 'Enebakk', null, 'Flerbrukshall', array['Håndball','Fotball','Basket','Innebandy','Badminton']::text[], '🏟️', false),
    ('Mini-flerbrukshallen Ytre Enebakk skole', 'Enebakk', null, 'Flerbrukshall', array['Håndball','Volleyball','Basket','Aktivitet']::text[], '🏟️', false),

    -- Gjerdrum
    ('Gjerdrumshallen', 'Gjerdrum', 'Brådalsgutua 10, 2022 Gjerdrum', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),

    -- Hurdal
    ('Hurdal Idrettshall', 'Hurdal', null, 'Flerbrukshall', array['Håndball','Friidrett','Volleyball','Basket']::text[], '🏟️', false)

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
-- select name, municipality, address, venue_type from public.venues where status = 'approved' and municipality in (
--   'Asker','Bærum','Lillestrøm','Lørenskog','Rælingen','Nordre Follo','Ås','Frogn','Vestby','Nesodden','Ullensaker','Eidsvoll','Nes','Nannestad','Aurskog-Høland','Enebakk','Gjerdrum','Hurdal'
-- ) order by municipality, name;
