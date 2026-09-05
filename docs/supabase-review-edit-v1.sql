-- Tribunesliter: konsistent vurderingsflyt + sikker redigering av egen vurdering
-- Kjør denne én gang i Supabase SQL Editor før/ved utrulling av app-patchen.
-- Scriptet er idempotent.

-- Offentlig lesing går gjennom trygge visninger/RPC-er. Base-tabellene beholder
-- eier-/moderatorlesing slik at anonymous_device_id ikke eksponeres offentlig.
create or replace function public.get_public_reviews_for_venue(p_venue_id uuid)
returns table (
  id uuid,
  venue_id uuid,
  user_name text,
  tribunesliter_minutes int,
  comfort_score int,
  view_score int,
  temperature_score int,
  accessibility_score int,
  event_type text,
  visit_date date,
  comment text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.id,
    r.venue_id,
    coalesce(nullif(r.user_name, ''), p.display_name, p.username, 'Innlogget bruker')::text,
    r.tribunesliter_minutes,
    r.comfort_score,
    r.view_score,
    r.temperature_score,
    r.accessibility_score,
    r.event_type,
    r.visit_date,
    r.comment,
    r.created_at
  from public.reviews r
  left join public.profiles p on p.id = r.user_id
  where r.venue_id = p_venue_id
    and r.status = 'approved'
    and r.approved = true
  order by r.visit_date desc, r.created_at desc
$$;

create or replace function public.get_owned_reviews(
  p_anonymous_device_id text,
  p_venue_id uuid
)
returns table (
  id uuid,
  venue_id uuid,
  user_name text,
  tribunesliter_minutes int,
  comfort_score int,
  view_score int,
  temperature_score int,
  accessibility_score int,
  event_type text,
  visit_date date,
  comment text,
  created_at timestamptz,
  venue_municipality text,
  venue_is_outdoor boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.id,
    r.venue_id,
    coalesce(nullif(r.user_name, ''), p.display_name, p.username, 'Innlogget bruker')::text,
    r.tribunesliter_minutes,
    r.comfort_score,
    r.view_score,
    r.temperature_score,
    r.accessibility_score,
    r.event_type,
    r.visit_date,
    r.comment,
    r.created_at,
    v.municipality,
    v.is_outdoor
  from public.reviews r
  join public.venues v on v.id = r.venue_id
  left join public.profiles p on p.id = r.user_id
  where r.status = 'approved'
    and r.approved = true
    and (p_venue_id is null or r.venue_id = p_venue_id)
    and (
      (auth.uid() is not null and r.user_id = auth.uid())
      or (
        p_anonymous_device_id is not null
        and char_length(p_anonymous_device_id) between 8 and 80
        and r.anonymous_device_id = p_anonymous_device_id
      )
    )
  order by r.created_at desc
$$;

create or replace function public.get_owned_facility_reports(p_anonymous_device_id text)
returns table (
  id uuid,
  venue_id uuid,
  user_name text,
  seating_type text,
  seat_comfort int,
  has_backrest boolean,
  heating_level int,
  toilet_quality int,
  kiosk_status text,
  parking text,
  accessibility int,
  roof_cover boolean,
  view_quality int,
  noise_level int,
  notes text,
  created_at timestamptz,
  venue_municipality text,
  venue_is_outdoor boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    fr.id,
    fr.venue_id,
    coalesce(nullif(fr.user_name, ''), p.display_name, p.username, 'Innlogget bruker')::text,
    fr.seating_type,
    fr.seat_comfort,
    fr.has_backrest,
    fr.heating_level,
    fr.toilet_quality,
    fr.kiosk_status,
    fr.parking,
    fr.accessibility,
    fr.roof_cover,
    fr.view_quality,
    fr.noise_level,
    fr.notes,
    fr.created_at,
    v.municipality,
    v.is_outdoor
  from public.facility_reports fr
  join public.venues v on v.id = fr.venue_id
  left join public.profiles p on p.id = fr.user_id
  where fr.status = 'approved'
    and fr.approved = true
    and (
      (auth.uid() is not null and fr.user_id = auth.uid())
      or (
        p_anonymous_device_id is not null
        and char_length(p_anonymous_device_id) between 8 and 80
        and fr.anonymous_device_id = p_anonymous_device_id
      )
    )
  order by fr.created_at desc
$$;

create or replace function public.update_owned_review(
  p_review_id uuid,
  p_anonymous_device_id text,
  p_user_name text,
  p_tribunesliter_minutes int,
  p_comfort_score int,
  p_view_score int,
  p_temperature_score int,
  p_accessibility_score int,
  p_event_type text,
  p_visit_date date,
  p_comment text
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_review public.reviews%rowtype;
begin
  if p_review_id is null then
    raise exception using errcode = '22023', message = 'Mangler vurdering å oppdatere.';
  end if;
  if length(trim(coalesce(p_user_name, ''))) not between 2 and 40 then
    raise exception using errcode = '22023', message = 'Navn eller kallenavn må være 2–40 tegn.';
  end if;
  if p_visit_date > current_date then
    raise exception using errcode = '22023', message = 'Besøksdato kan ikke være i fremtiden.';
  end if;
  if char_length(coalesce(p_comment, '')) > 500 then
    raise exception using errcode = '22023', message = 'Kommentar er for lang.';
  end if;

  update public.reviews
  set
    user_name = trim(p_user_name),
    tribunesliter_minutes = p_tribunesliter_minutes,
    comfort_score = p_comfort_score,
    view_score = p_view_score,
    temperature_score = p_temperature_score,
    accessibility_score = p_accessibility_score,
    event_type = p_event_type,
    visit_date = p_visit_date,
    comment = nullif(trim(coalesce(p_comment, '')), '')
  where id = p_review_id
    and status = 'approved'
    and approved = true
    and (
      (auth.uid() is not null and user_id = auth.uid())
      or (
        p_anonymous_device_id is not null
        and char_length(p_anonymous_device_id) between 8 and 80
        and anonymous_device_id = p_anonymous_device_id
      )
    )
  returning * into updated_review;

  if not found then
    raise exception using errcode = '42501', message = 'Du kan bare redigere vurderinger som tilhører denne brukeren eller enheten.';
  end if;

  return updated_review;
end;
$$;

revoke all on function public.get_public_reviews_for_venue(uuid) from public;
revoke all on function public.get_owned_reviews(text, uuid) from public;
revoke all on function public.get_owned_facility_reports(text) from public;
revoke all on function public.update_owned_review(uuid, text, text, int, int, int, int, int, text, date, text) from public;
grant execute on function public.get_public_reviews_for_venue(uuid) to anon, authenticated;
grant execute on function public.get_owned_reviews(text, uuid) to anon, authenticated;
grant execute on function public.get_owned_facility_reports(text) to anon, authenticated;
grant execute on function public.update_owned_review(uuid, text, text, int, int, int, int, int, text, date, text) to anon, authenticated;


-- Offentlige klienter leser kun de trygge visningene.
grant select on public.approved_reviews_public to anon, authenticated;
grant select on public.venue_public_cards to anon, authenticated;

-- anonymous_device_id brukes som en lokal eierskapstoken og skal ikke kunne leses
-- fra base-tabellene av tilfeldige besøkende. Moderator/admin beholder innsyn.
drop policy if exists "Public can read approved reviews" on public.reviews;
drop policy if exists "Owners and moderators can read reviews" on public.reviews;
create policy "Owners and moderators can read reviews" on public.reviews
  for select using (user_id = auth.uid() or (select public.current_user_role()) in ('moderator', 'admin'));

drop policy if exists "Public can read approved facilities" on public.facility_reports;
drop policy if exists "Owners and moderators can read facilities" on public.facility_reports;
create policy "Owners and moderators can read facilities" on public.facility_reports
  for select using (user_id = auth.uid() or (select public.current_user_role()) in ('moderator', 'admin'));
