-- Tribunesliter Østfold seed v1
-- Kjør i Supabase SQL Editor etter docs/supabase-schema.sql.
-- Scriptet legger inn godkjente venue-rader. Treff på samme navn+kommune oppdateres med startdata/adresse.
-- Fasilitetsdata er med vilje ikke forhåndsutfylt; bruk «Rett info» i appen for bekreftede rapporter.

with src(name, municipality, address, venue_type, sport_tags, cover_emoji, is_outdoor) as (

  values
    -- Sarpsborg
    ('Sarpsborghallen', 'Sarpsborg', 'Dronningens gt. 53, 1723 Sarpsborg', 'Idrettshall', array['Håndball','Futsal','Volleyball','Basket','Svømming']::text[], '🏟️', false),
    ('Skjeberghallen', 'Sarpsborg', 'Rådhusveien 13, 1739 Borgenhaugen', 'Idrettshall', array['Håndball','Innebandy','Volleyball']::text[], '🏟️', false),
    ('Grålumhallen', 'Sarpsborg', 'Grålumveien 203, 1712 Grålum', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏐', false),
    ('Tindlundhallen', 'Sarpsborg', 'Myrstadveien 2, 1718 Greåker', 'Flerbrukshall', array['Håndball','Innebandy','Basket']::text[], '🏟️', false),
    ('Kalneshallen', 'Sarpsborg', 'Agronomveien 6, 1712 Grålum', 'Idrettshall', array['Håndball','Volleyball','Innebandy']::text[], '🏟️', false),
    ('Sandbakkenhallen', 'Sarpsborg', 'Sandbakkenfaret 18, 1743 Klavestadhaugen', 'Flerbrukshall', array['Håndball','Innebandy','Volleyball','Basket']::text[], '🏟️', false),
    ('Sparta Amfi', 'Sarpsborg', 'Sarpsborgveien 10, 1711 Sarpsborg', 'Ishall', array['Ishockey','Skøyter']::text[], '🏒', false),
    ('Ungdomshallen', 'Sarpsborg', 'Sarpsborgveien 10, 1711 Sarpsborg', 'Ishall', array['Ishockey','Skøyter']::text[], '🏒', false),
    ('Sarpsborg stadion', 'Sarpsborg', 'Haftor Jonssons gt. 21, 1725 Sarpsborg', 'Stadion', array['Fotball']::text[], '⚽', true),
    ('Kunstisbanen Sarpsborg', 'Sarpsborg', 'Haftor Jonssons gt. 19, 1711 Sarpsborg', 'Kunstis', array['Skøyter']::text[], '⛸️', true),

    -- Fredrikstad
    ('Kongsten Arena', 'Fredrikstad', 'Torsnesveien 12, 1630 Gamle Fredrikstad', 'Arena', array['Håndball','Futsal','Volleyball','Basket']::text[], '🏟️', false),
    ('Borgehallen', 'Fredrikstad', 'Borgeveien 48A, 1654 Sellebakk', 'Idrettshall', array['Håndball','Innebandy','Volleyball']::text[], '🏟️', false),
    ('Glemmenhallen', 'Fredrikstad', 'Freskoveien 1, 1605 Fredrikstad', 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Blomsterøyhallen', 'Fredrikstad', 'Enhuusveien 44, 1679 Kråkerøy', 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Kvernhushallen', 'Fredrikstad', 'Kvernhusveien 1, 1615 Fredrikstad', 'Idrettshall', array['Håndball','Innebandy','Volleyball']::text[], '🏟️', false),
    ('Gresvikhallen', 'Fredrikstad', 'Granliveien 27, 1621 Gressvik', 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Lislebyhallen', 'Fredrikstad', 'Leiegata 17, 1617 Fredrikstad', 'Idrettshall', array['Basket','Håndball','Volleyball']::text[], '🏀', false),
    ('Trosvikhallen', 'Fredrikstad', 'Unnebergveien 19, 1613 Fredrikstad', 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Merkur Arena', 'Fredrikstad', 'Merkurveien 2, 1613 Fredrikstad', 'Utendørsbane', array['Håndball','Fotball']::text[], '🤾', true),
    ('Øssia Arena', 'Fredrikstad', 'Lundheimveien 6, 1636 Gamle Fredrikstad', 'Utendørsbane', array['Håndball','Fotball']::text[], '🤾', true),

    -- Moss
    ('Melløs stadion', 'Moss', null, 'Stadion', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Bellevue Stadion', 'Moss', null, 'Stadion', array['Fotball']::text[], '⚽', true),
    ('Nøkkeland Kunstgressbane', 'Moss', null, 'Kunstgressbane', array['Fotball']::text[], '⚽', true),
    ('Øre idrettsanlegg', 'Moss', null, 'Idrettsanlegg', array['Fotball','Friidrett']::text[], '⚽', true),
    ('Nøkkelandhallen', 'Moss', null, 'Idrettshall', array['Håndball','Basket','Volleyball']::text[], '🏀', false),
    ('Ryggehallen', 'Moss', null, 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Øreåshallen', 'Moss', null, 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Ekholthallen', 'Moss', null, 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Hoppern Idrettshall', 'Moss', null, 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Larkollhallen', 'Moss', null, 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Mossehallen', 'Moss', 'Nesparken 10, 1530 Moss', 'Flerbrukshall', array['Håndball','Svømming','Volleyball','Basket']::text[], '🏟️', false),

    -- Halden
    ('Nexans arena Halden', 'Halden', 'Os allé 2B, 1777 Halden', 'Arena', array['Håndball','Fotball','Turn','Volleyball']::text[], '🏟️', false),
    ('Hjortsberghallen', 'Halden', 'Trafoveien 2, 1784 Halden', 'Idrettshall', array['Håndball']::text[], '🏟️', false),
    ('Risumhallen', 'Halden', 'Kommandantvei 37, 1769 Halden', 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Tistedalshallen', 'Halden', 'Stadionveien 10, 1791 Tistedal', 'Idrettshall', array['Håndball','Fotball']::text[], '🏟️', false),
    ('Porsneshallen', 'Halden', null, 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Remmenhallen', 'Halden', 'BRA-veien 4, 1783 Halden', 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),

    -- Indre Østfold
    ('Askimhallen', 'Indre Østfold', 'Kirkegata 9, 1807 Askim', 'Idrettshall', array['Håndball','Volleyball','Basket']::text[], '🏟️', false),
    ('Mysenhallen', 'Indre Østfold', null, 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Trøgstadhallen', 'Indre Østfold', 'Festningsåsen 5, 1860 Trøgstad', 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Mysen rackethall', 'Indre Østfold', 'Smedgata 21, 1850 Mysen', 'Rackethall', array['Tennis','Badminton','Squash','Bordtennis','Padel']::text[], '🎾', false),
    ('Båstad kunstisbane', 'Indre Østfold', 'Ekhaugenveien 3, 1866 Båstad', 'Kunstisbane', array['Skøyter']::text[], '⛸️', true),

    -- Andre Østfold-kommuner
    ('Rakkestadhallen', 'Rakkestad', 'Skoleveien 12, 1890 Rakkestad', 'Flerbrukshall', array['Håndball','Volleyball','Turn']::text[], '🏟️', false),
    ('Degerneshallen', 'Rakkestad', 'Idrettsveien 8, 1892 Degernes', 'Flerbrukshall', array['Håndball','Volleyball','Turn']::text[], '🏟️', false),
    ('Markerhallen', 'Marker', 'Haldenveien 24, 1870 Ørje', 'Flerbrukshall', array['Håndball','Volleyball','Turn']::text[], '🏟️', false),
    ('Rådehallen', 'Råde', 'Idrettsveien 26, 1640 Råde', 'Idrettshall', array['Håndball','Innebandy','Tennis']::text[], '🏟️', false),
    ('Hvalerhallen', 'Hvaler', 'Rødveien 28, 1684 Vesterøy', 'Idrettshall', array['Volleyball','Håndball']::text[], '🏐', false),
    ('Vålerhallen', 'Våler', 'Skoleveien 1, 1592 Våler i Østfold', 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Aremarkhallen', 'Aremark', null, 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false),
    ('Skiptvethallen', 'Skiptvet', null, 'Idrettshall', array['Håndball','Volleyball']::text[], '🏟️', false)

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
-- select name, municipality, address from public.venues where status = 'approved' order by municipality, name;
