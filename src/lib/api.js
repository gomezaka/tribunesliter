export { hasSupabaseConfig } from './supabase';
import { supabase, hasSupabaseConfig } from './supabase';
import { demoReviews, demoVenues } from './demoData';

const LOCAL_REVIEW_KEY = 'tribunesliter.localReviews.v2';
const LOCAL_VENUE_KEY = 'tribunesliter.localVenueRequests.v2';
const LOCAL_CUSTOM_VENUE_KEY = 'tribunesliter.localVenues.v1';
const LOCAL_FACILITY_KEY = 'tribunesliter.localFacilityReports.v2';
const LOCAL_HIDDEN_REVIEW_KEY = 'tribunesliter.hiddenReviews.v2';
const LOCAL_ARCHIVED_VENUE_KEY = 'tribunesliter.archivedVenues.v1';
const ANONYMOUS_DEVICE_ID_KEY = 'tribunesliter.anonymousDeviceId.v1';
const USERNAME_EMAIL_DOMAIN = 'tribunesliter.local';
const USERNAME_PATTERN = /^[a-z0-9._-]{3,24}$/;
const MAX_COMMENT_LENGTH = 500;
const MAX_NOTES_LENGTH = 500;
const SUPABASE_PAGE_SIZE = 1000;

function readLocal(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createDeviceId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getAnonymousDeviceId() {
  if (typeof localStorage === 'undefined') return null;
  const existing = localStorage.getItem(ANONYMOUS_DEVICE_ID_KEY);
  if (existing) return existing;
  const next = createDeviceId();
  localStorage.setItem(ANONYMOUS_DEVICE_ID_KEY, next);
  return next;
}

function normalizeVenue(row) {
  return {
    ...row,
    sport_tags: row.sport_tags ?? [],
    packlist: row.packlist ?? [],
    facilities: row.facilities ?? row.latest_facility_report ?? {},
    tribunesliter_minutes: Number(row.tribunesliter_minutes ?? row.avg_tribunesliter_minutes ?? 0),
    review_count: Number(row.review_count ?? 0),
  };
}

function normalizeReview(row) {
  return {
    ...row,
    venue_name: row.venue_name ?? row.venues?.name ?? row.venue?.name ?? '',
    user_name: row.user_name ?? row.display_name ?? 'Innlogget bruker',
  };
}

function normalizeFacilityReport(row) {
  return {
    ...row,
    venue_name: row.venue_name ?? row.venues?.name ?? row.venue?.name ?? '',
    user_name: row.user_name ?? row.profiles?.display_name ?? 'Innlogget bruker',
  };
}

function visibleLocalContribution(row) {
  return !row?.status || row.status === 'approved' || row.approved === true;
}

function matchesLocalOwner(row, userId, deviceId) {
  return Boolean((userId && row?.user_id === userId) || (deviceId && row?.anonymous_device_id === deviceId));
}

function cleanUserName(value) {
  return String(value || '').trim().slice(0, 40);
}

function cleanLimitedText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanVenueText(value, maxLength = 120) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function sameVenue(a, b) {
  return cleanVenueText(a?.name).toLowerCase() === cleanVenueText(b?.name).toLowerCase()
    && cleanVenueText(a?.municipality).toLowerCase() === cleanVenueText(b?.municipality).toLowerCase();
}

function localVenueId(name, municipality, existingVenues = []) {
  const slug = `${name}-${municipality}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'nytt-anlegg';
  const usedIds = new Set(existingVenues.map((venue) => venue.id));
  let candidate = `local-${slug}`;
  let index = 2;
  while (usedIds.has(candidate)) {
    candidate = `local-${slug}-${index}`;
    index += 1;
  }
  return candidate;
}

function buildVenuePayload(venue) {
  const name = cleanVenueText(venue.name, 80);
  const municipality = cleanVenueText(venue.municipality, 80);
  if (!name) throw new Error('Skriv inn navn på anlegget.');
  if (!municipality) throw new Error('Skriv inn kommune for anlegget.');

  const venueType = cleanVenueText(venue.venue_type, 60) || 'Flerbrukshall';
  const isOutdoor = Boolean(venue.is_outdoor || /utendørs|stadion|bane/i.test(venueType));
  const sportTags = Array.isArray(venue.sport_tags)
    ? venue.sport_tags.map((tag) => cleanVenueText(tag, 40)).filter(Boolean).slice(0, 6)
    : [];

  return {
    name,
    municipality,
    address: cleanVenueText(venue.address, 160) || null,
    venue_type: venueType,
    sport_tags: sportTags,
    cover_emoji: venue.cover_emoji || (isOutdoor ? '⚽' : '🏟️'),
    is_outdoor: isOutdoor,
    status: 'approved',
  };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function cleanVisitDate(value) {
  const date = String(value || todayIsoDate()).slice(0, 10);
  if (date > todayIsoDate()) throw new Error('Besøksdato kan ikke være i fremtiden.');
  return date;
}

function throwSubmitError(error) {
  if (error?.code === '23505') {
    throw new Error('Denne enheten har allerede sjekket inn dette anlegget på valgt dato.');
  }
  throw error;
}

function hasModeratorRole(profile) {
  return profile?.role === 'moderator' || profile?.role === 'admin';
}

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function authEmailForUsername(username) {
  const normalized = normalizeUsername(username);
  if (normalized.includes('@')) return normalized;
  if (!USERNAME_PATTERN.test(normalized)) {
    throw new Error('Brukernavn må være 3-24 tegn og kan bare bruke bokstaver, tall, punktum, bindestrek og understrek.');
  }
  return `${normalized}@${USERNAME_EMAIL_DOMAIN}`;
}

function displayNameForUsername(username) {
  const normalized = normalizeUsername(username);
  return normalized.includes('@') ? normalized.split('@')[0] : normalized;
}

function usernameForMetadata(username) {
  const normalized = normalizeUsername(username);
  return normalized.includes('@') ? normalized.split('@')[0] : normalized;
}

function readableErrorMessage(error) {
  const candidates = [
    typeof error === 'string' ? error : '',
    error?.message,
    error?.error_description,
    error?.msg,
  ];

  for (const candidate of candidates) {
    const message = String(candidate || '').trim();
    if (message && message !== '{}' && message !== '[]' && message !== '[object Object]') return message;
  }
  return '';
}

function authErrorMessage(error) {
  const message = readableErrorMessage(error);
  if (/email.*rate|rate.*email|rate limit|over email send rate limit|email rate limit/i.test(message)) {
    return 'Vi klarte ikke å opprette brukeren akkurat nå. Prøv igjen litt senere, eller kontakt administrator.';
  }
  if (/invalid login credentials/i.test(message)) {
    return 'Feil brukernavn eller passord. Hvis kontoen nettopp ble opprettet, kan den fortsatt være under klargjøring.';
  }
  if (/user already registered|already registered|already exists/i.test(message)) return 'Brukernavnet er allerede i bruk.';
  if (/password/i.test(message)) return 'Passordet må være minst 6 tegn.';
  return message || 'Vi klarte ikke å fullføre innloggingen akkurat nå. Prøv igjen litt senere.';
}

async function fetchProfileForUser(userId) {
  if (!hasSupabaseConfig || !userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, role, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error && (error.code === '42703' || /username/i.test(error.message || ''))) {
    const fallback = await supabase
      .from('profiles')
      .select('id, display_name, role, created_at')
      .eq('id', userId)
      .maybeSingle();
    if (fallback.error) throw fallback.error;
    return fallback.data ? { ...fallback.data, username: fallback.data.display_name } : null;
  }

  if (error) throw error;
  return data;
}

export async function getCurrentProfile() {
  if (!hasSupabaseConfig) return { id: 'demo-user', username: 'demo-admin', display_name: 'Demo-admin', role: 'admin' };
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return fetchProfileForUser(data.user?.id);
}

export async function getSession() {
  if (!hasSupabaseConfig) {
    const user = getDemoUser();
    return { session: null, user, profile: user ? { id: 'demo-user', username: user.user_metadata?.username || 'demo-admin', display_name: user.user_metadata?.display_name || 'Demo-admin', role: 'admin' } : null, mode: 'demo' };
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const user = data.session?.user ?? null;
  const profile = user ? await fetchProfileForUser(user.id) : null;
  return { session: data.session, user, profile, mode: 'supabase' };
}

export async function listenToAuth(callback) {
  if (!hasSupabaseConfig) return () => {};
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    const user = session?.user ?? null;
    const profile = user ? await fetchProfileForUser(user.id) : null;
    callback({ user, profile });
  });
  return () => data.subscription.unsubscribe();
}

export async function signInWithUsernamePassword(username, password) {
  if (!hasSupabaseConfig) {
    const email = authEmailForUsername(username);
    const displayName = displayNameForUsername(username) || 'demo-bruker';
    const demoUser = { id: 'demo-user', email, user_metadata: { display_name: displayName, username: displayName } };
    localStorage.setItem('tribunesliter.demoUser', JSON.stringify(demoUser));
    return { demo: true, user: demoUser, profile: { id: 'demo-user', username: displayName, display_name: displayName, role: 'admin' } };
  }

  try {
    const email = authEmailForUsername(username);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    const profile = data.user ? await fetchProfileForUser(data.user.id) : null;
    return { demo: false, user: data.user, profile };
  } catch (error) {
    console.warn('Supabase sign-in failed:', error);
    throw new Error(authErrorMessage(error));
  }
}

export async function signUpWithUsernamePassword(username, password) {
  const displayName = displayNameForUsername(username);
  const normalizedUsername = usernameForMetadata(username);

  if (!hasSupabaseConfig) {
    const email = authEmailForUsername(username);
    const demoUser = { id: 'demo-user', email, user_metadata: { display_name: displayName, username: normalizedUsername } };
    localStorage.setItem('tribunesliter.demoUser', JSON.stringify(demoUser));
    return { demo: true, user: demoUser, profile: { id: 'demo-user', username: normalizedUsername, display_name: displayName, role: 'admin' } };
  }

  try {
    const email = authEmailForUsername(username);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: normalizedUsername,
          display_name: displayName,
        },
      },
    });
    if (error) throw error;
    const profile = data.user
      ? (await fetchProfileForUser(data.user.id)) || { id: data.user.id, username: normalizedUsername, display_name: displayName, role: 'user' }
      : null;
    return { demo: false, user: data.user, profile, needsConfirmation: Boolean(data.user && !data.session) };
  } catch (error) {
    console.warn('Supabase sign-up failed:', error);
    throw new Error(authErrorMessage(error));
  }
}

export async function signOut() {
  if (!hasSupabaseConfig) {
    localStorage.removeItem('tribunesliter.demoUser');
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function getDemoUser() {
  return readLocal('tribunesliter.demoUser', null);
}

async function getOptionalAuthenticatedUser() {
  if (!hasSupabaseConfig) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error && !/session/i.test(error.message || '')) throw error;
  return data?.user || null;
}

export async function fetchVenues() {
  if (!hasSupabaseConfig) {
    const localReviews = readLocal(LOCAL_REVIEW_KEY, []);
    const localVenues = readLocal(LOCAL_CUSTOM_VENUE_KEY, []);
    const localFacilityReports = readLocal(LOCAL_FACILITY_KEY, []);
    const hiddenIds = new Set(readLocal(LOCAL_HIDDEN_REVIEW_KEY, []));
    const archivedVenueIds = new Set(readLocal(LOCAL_ARCHIVED_VENUE_KEY, []));
    return [...demoVenues, ...localVenues].filter((venue) => !archivedVenueIds.has(venue.id)).map((venue) => {
      const allReviews = [...demoReviews, ...localReviews]
        .filter((review) => review.venue_id === venue.id)
        .filter((review) => review.status !== 'pending' && review.status !== 'rejected' && review.status !== 'hidden')
        .filter((review) => !hiddenIds.has(review.id));
      const latestFacility = localFacilityReports
        .filter((report) => report.venue_id === venue.id && report.status === 'approved')
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
      const reviewPatch = allReviews.length
        ? {
            tribunesliter_minutes: Math.round(allReviews.reduce((sum, review) => sum + Number(review.tribunesliter_minutes), 0) / allReviews.length),
            review_count: allReviews.length,
          }
        : {};
      return latestFacility
        ? { ...venue, ...reviewPatch, facilities: latestFacility, facility_reported_at: latestFacility.created_at }
        : { ...venue, ...reviewPatch };
    });
  }

  const rows = [];
  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const { data, error } = await supabase
      .from('venue_public_cards')
      .select('*')
      .order('name', { ascending: true })
      .order('municipality', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (error) throw error;
    rows.push(...data);
    if (data.length < SUPABASE_PAGE_SIZE) break;
  }

  return rows.map(normalizeVenue);
}

export async function createVenue(venue) {
  const payload = buildVenuePayload(venue);

  if (!hasSupabaseConfig) {
    const localVenues = readLocal(LOCAL_CUSTOM_VENUE_KEY, []);
    const existingVenue = [...demoVenues, ...localVenues].find((item) => sameVenue(item, payload));
    if (existingVenue) return normalizeVenue(existingVenue);

    const now = new Date().toISOString();
    const localVenue = normalizeVenue({
      ...payload,
      id: localVenueId(payload.name, payload.municipality, [...demoVenues, ...localVenues]),
      summary: 'Ingen vurderinger ennå. Bli den første som tester tribunen.',
      facilities: {},
      packlist: payload.is_outdoor
        ? ['Sitteunderlag', 'Varm drikke', 'Ekstra lag', 'Regnjakke']
        : ['Sitteunderlag', 'Kaffe', 'Småpenger til kiosk'],
      created_at: now,
      updated_at: now,
    });
    writeLocal(LOCAL_CUSTOM_VENUE_KEY, [localVenue, ...localVenues]);
    return localVenue;
  }

  const authUser = await getOptionalAuthenticatedUser();
  const { data, error } = await supabase
    .from('venues')
    .insert({ ...payload, created_by: authUser?.id || null })
    .select('*')
    .single();
  if (error) throw error;
  return normalizeVenue(data);
}

export async function archiveVenue(venueId) {
  if (!venueId) throw new Error('Mangler anlegg å arkivere.');

  if (!hasSupabaseConfig) {
    const archivedVenueIds = new Set(readLocal(LOCAL_ARCHIVED_VENUE_KEY, []));
    archivedVenueIds.add(venueId);
    writeLocal(LOCAL_ARCHIVED_VENUE_KEY, [...archivedVenueIds]);
    return;
  }

  const profile = await getCurrentProfile();
  if (!hasModeratorRole(profile)) throw new Error('Denne brukeren mangler moderator- eller adminrolle.');

  const { error } = await supabase
    .from('venues')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', venueId);
  if (error) throw error;
}

export async function fetchVenue(venueId) {
  const venues = await fetchVenues();
  const venue = venues.find((item) => item.id === venueId);
  if (!venue) throw new Error('Fant ikke anlegget.');
  return venue;
}

export async function fetchReviews(venueId) {
  if (!hasSupabaseConfig) {
    const hiddenIds = new Set(readLocal(LOCAL_HIDDEN_REVIEW_KEY, []));
    return [...demoReviews, ...readLocal(LOCAL_REVIEW_KEY, [])]
      .filter((review) => review.venue_id === venueId)
      .filter((review) => review.status !== 'pending' && review.status !== 'rejected' && review.status !== 'hidden')
      .filter((review) => !hiddenIds.has(review.id))
      .sort((a, b) => String(b.visit_date).localeCompare(String(a.visit_date)));
  }

  const { data, error } = await supabase
    .from('approved_reviews_public')
    .select('*')
    .eq('venue_id', venueId)
    .order('visit_date', { ascending: false });

  if (error) throw error;
  return data.map(normalizeReview);
}

function buildFacilityPayload(review, userId, options = {}) {
  const publish = Boolean(options.publish);
  return {
    venue_id: review.venue_id,
    user_id: userId || null,
    anonymous_device_id: getAnonymousDeviceId(),
    user_name: cleanUserName(review.user_name) || null,
    seating_type: review.facility_seating_type || review.seating_type || null,
    seat_comfort: Number(review.facility_seat_comfort || review.seat_comfort || review.comfort_score || 3),
    has_backrest: Boolean(review.facility_has_backrest ?? review.has_backrest),
    heating_level: Number(review.facility_heating_level || review.heating_level || review.temperature_score || 3),
    toilet_quality: Number(review.facility_toilet_quality || review.toilet_quality || 3),
    kiosk_status: review.facility_kiosk_status || review.kiosk_status || null,
    parking: review.facility_parking || review.parking || null,
    accessibility: Number(review.facility_accessibility || review.accessibility || review.accessibility_score || 3),
    roof_cover: Boolean(review.facility_roof_cover ?? review.roof_cover),
    view_quality: Number(review.facility_view_quality || review.view_quality || review.view_score || 3),
    noise_level: Number(review.facility_noise_level || review.noise_level || 3),
    notes: cleanLimitedText(review.facility_notes || review.notes, MAX_NOTES_LENGTH) || null,
    approved: publish,
    status: publish ? 'approved' : 'pending',
  };
}

function hasFacilityReport(review) {
  return Boolean(review.include_facilities);
}

export async function submitReview(review) {
  const userName = cleanUserName(review.user_name);
  if (!userName) throw new Error('Skriv inn navn eller kallenavn før du sender vurderingen.');
  const comment = cleanLimitedText(review.comment, MAX_COMMENT_LENGTH);
  const anonymousDeviceId = getAnonymousDeviceId();
  const visitDate = cleanVisitDate(review.visit_date);

  if (!hasSupabaseConfig) {
    const demoUser = getDemoUser();
    const reviews = readLocal(LOCAL_REVIEW_KEY, []);
    const newReview = {
      ...review,
      id: crypto.randomUUID(),
      user_id: demoUser?.id || null,
      anonymous_device_id: anonymousDeviceId,
      user_name: userName,
      visit_date: visitDate,
      comment,
      approved: true,
      status: 'approved',
      created_at: new Date().toISOString(),
    };
    writeLocal(LOCAL_REVIEW_KEY, [newReview, ...reviews]);
    if (hasFacilityReport(review)) {
      const reports = readLocal(LOCAL_FACILITY_KEY, []);
      const facilityPayload = {
        ...buildFacilityPayload(review, demoUser?.id || null, { publish: true }),
        id: crypto.randomUUID(),
        venue_name: review.venue_name || '',
        created_at: new Date().toISOString(),
      };
      writeLocal(LOCAL_FACILITY_KEY, [facilityPayload, ...reports]);
    }
    return newReview;
  }

  const authUser = await getOptionalAuthenticatedUser();

  const payload = {
    venue_id: review.venue_id,
    user_id: authUser?.id || null,
    anonymous_device_id: anonymousDeviceId,
    user_name: userName,
    tribunesliter_minutes: Number(review.tribunesliter_minutes),
    comfort_score: Number(review.comfort_score),
    view_score: Number(review.view_score),
    temperature_score: Number(review.temperature_score),
    accessibility_score: Number(review.accessibility_score),
    event_type: review.event_type,
    visit_date: visitDate,
    comment,
    approved: true,
    status: 'approved',
  };

  const { data, error } = await supabase.from('reviews').insert(payload).select('*').single();
  if (error) throwSubmitError(error);

  if (hasFacilityReport(review)) {
    const facilityPayload = buildFacilityPayload(review, authUser?.id || null, { publish: true });
    const { error: facilityError } = await supabase.from('facility_reports').insert(facilityPayload);
    if (facilityError) throw facilityError;
  }

  return data;
}

export async function submitFacilityReport(report) {
  const authUser = await getOptionalAuthenticatedUser();
  const userName = cleanUserName(report.user_name) || 'Anonym sliter';

  if (!hasSupabaseConfig) {
    const reports = readLocal(LOCAL_FACILITY_KEY, []);
    const payload = {
      ...buildFacilityPayload({ ...report, user_name: userName }, getDemoUser()?.id || null, { publish: true }),
      id: crypto.randomUUID(),
      venue_name: report.venue_name || '',
      user_name: userName,
      created_at: new Date().toISOString(),
    };
    writeLocal(LOCAL_FACILITY_KEY, [payload, ...reports]);
    return payload;
  }

  const payload = buildFacilityPayload({ ...report, user_name: userName }, authUser?.id || null, { publish: true });
  const { data, error } = await supabase.from('facility_reports').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function submitVenueRequest(request) {
  if (!hasSupabaseConfig) {
    const requests = readLocal(LOCAL_VENUE_KEY, []);
    const payload = { ...request, id: crypto.randomUUID(), status: 'pending', created_at: new Date().toISOString() };
    writeLocal(LOCAL_VENUE_KEY, [payload, ...requests]);
    return payload;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Du må være innlogget for å foreslå nytt anlegg.');

  const payload = {
    ...request,
    user_id: authData.user.id,
    status: 'pending',
  };
  const { data, error } = await supabase.from('venue_requests').insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function fetchBadgeContributions() {
  const deviceId = getAnonymousDeviceId();

  if (!hasSupabaseConfig) {
    const demoUser = getDemoUser();
    const userId = demoUser?.id || null;
    return {
      reviews: readLocal(LOCAL_REVIEW_KEY, [])
        .filter(visibleLocalContribution)
        .filter((row) => matchesLocalOwner(row, userId, deviceId)),
      facilityReports: readLocal(LOCAL_FACILITY_KEY, [])
        .filter(visibleLocalContribution)
        .filter((row) => matchesLocalOwner(row, userId, deviceId)),
      venueRequests: [
        ...readLocal(LOCAL_VENUE_KEY, []).filter((row) => row.status !== 'rejected'),
        ...readLocal(LOCAL_CUSTOM_VENUE_KEY, []),
      ],
    };
  }

  const authUser = await getOptionalAuthenticatedUser();

  async function fetchOwnedRows(table, select, options = {}) {
    if (!authUser?.id && !deviceId) return [];

    const rows = [];
    for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
      let query = supabase
        .from(table)
        .select(select)
        .order('created_at', { ascending: true })
        .range(from, from + SUPABASE_PAGE_SIZE - 1);

      if (options.status) query = query.eq('status', options.status);
      if (authUser?.id && deviceId) query = query.or(`user_id.eq.${authUser.id},anonymous_device_id.eq.${deviceId}`);
      else if (authUser?.id) query = query.eq('user_id', authUser.id);
      else query = query.eq('anonymous_device_id', deviceId);

      const { data, error } = await query;
      if (error) throw error;
      rows.push(...data);
      if (data.length < SUPABASE_PAGE_SIZE) break;
    }
    return rows;
  }

  const [reviews, facilityReports, venueRequests] = await Promise.all([
    fetchOwnedRows('reviews', 'id, venue_id, user_id, anonymous_device_id, user_name, tribunesliter_minutes, comfort_score, view_score, temperature_score, accessibility_score, event_type, visit_date, comment, created_at, venues(id, municipality, is_outdoor)', { status: 'approved' }),
    fetchOwnedRows('facility_reports', 'id, venue_id, user_id, anonymous_device_id, user_name, seating_type, seat_comfort, has_backrest, heating_level, toilet_quality, kiosk_status, parking, accessibility, roof_cover, view_quality, noise_level, notes, created_at, venues(id, municipality, is_outdoor)', { status: 'approved' }),
    authUser?.id
      ? supabase
          .from('venue_requests')
          .select('id, user_id, name, municipality, status, created_at')
          .eq('user_id', authUser.id)
          .neq('status', 'rejected')
          .then(({ data, error }) => {
            if (error) throw error;
            return data;
          })
      : Promise.resolve([]),
  ]);

  return { reviews, facilityReports, venueRequests };
}

export async function fetchPendingModeration() {
  if (!hasSupabaseConfig) {
    const localReviews = readLocal(LOCAL_REVIEW_KEY, []);
    const localFacilities = readLocal(LOCAL_FACILITY_KEY, []);
    return {
      reviews: [],
      approvedReviews: [...demoReviews, ...localReviews].filter((review) => !review.status || review.status === 'approved' || review.approved === true),
      facilityReports: localFacilities.filter((report) => report.status === 'approved' || report.approved === true),
      venueRequests: readLocal(LOCAL_VENUE_KEY, []).filter((request) => request.status === 'pending'),
    };
  }

  const profile = await getCurrentProfile();
  if (!hasModeratorRole(profile)) throw new Error('Denne brukeren mangler moderator- eller adminrolle.');

  const [approvedReviews, facilityReports, venueRequests] = await Promise.all([
    supabase.from('reviews').select('*, venues(name, is_outdoor)').eq('status', 'approved').order('created_at', { ascending: false }).limit(50),
    supabase.from('facility_reports').select('*, venues(name, is_outdoor)').eq('status', 'approved').order('created_at', { ascending: false }).limit(50),
    supabase.from('venue_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(50),
  ]);

  if (approvedReviews.error) throw approvedReviews.error;
  if (facilityReports.error) throw facilityReports.error;
  if (venueRequests.error) throw venueRequests.error;
  return {
    reviews: [],
    approvedReviews: approvedReviews.data.map(normalizeReview),
    facilityReports: facilityReports.data.map(normalizeFacilityReport),
    venueRequests: venueRequests.data,
  };
}

function updateLocalReview(reviewId, patch) {
  const reviews = readLocal(LOCAL_REVIEW_KEY, []);
  writeLocal(LOCAL_REVIEW_KEY, reviews.map((review) => (review.id === reviewId ? { ...review, ...patch } : review)));
}

function updateLocalFacilityReport(reportId, patch) {
  const reports = readLocal(LOCAL_FACILITY_KEY, []);
  writeLocal(LOCAL_FACILITY_KEY, reports.map((report) => (report.id === reportId ? { ...report, ...patch } : report)));
}

export async function approveReview(reviewId) {
  if (!hasSupabaseConfig) {
    updateLocalReview(reviewId, { approved: true, status: 'approved' });
    return;
  }
  const { error } = await supabase.from('reviews').update({ approved: true, status: 'approved' }).eq('id', reviewId);
  if (error) throw error;
}

export async function rejectReview(reviewId) {
  if (!hasSupabaseConfig) {
    updateLocalReview(reviewId, { approved: false, status: 'rejected' });
    return;
  }
  const { error } = await supabase.from('reviews').update({ approved: false, status: 'rejected' }).eq('id', reviewId);
  if (error) throw error;
}

export async function hideReview(reviewId) {
  if (!hasSupabaseConfig) {
    const hidden = new Set(readLocal(LOCAL_HIDDEN_REVIEW_KEY, []));
    hidden.add(reviewId);
    writeLocal(LOCAL_HIDDEN_REVIEW_KEY, [...hidden]);
    updateLocalReview(reviewId, { approved: false, status: 'hidden' });
    return;
  }
  const { error } = await supabase.from('reviews').update({ approved: false, status: 'hidden' }).eq('id', reviewId);
  if (error) throw error;
}


export async function approveFacilityReport(reportId) {
  if (!hasSupabaseConfig) {
    updateLocalFacilityReport(reportId, { approved: true, status: 'approved' });
    return;
  }
  const { error } = await supabase.from('facility_reports').update({ approved: true, status: 'approved' }).eq('id', reportId);
  if (error) throw error;
}

export async function rejectFacilityReport(reportId) {
  if (!hasSupabaseConfig) {
    updateLocalFacilityReport(reportId, { approved: false, status: 'rejected' });
    return;
  }
  const { error } = await supabase.from('facility_reports').update({ approved: false, status: 'rejected' }).eq('id', reportId);
  if (error) throw error;
}

export async function approveVenueRequest(request) {
  if (!hasSupabaseConfig) {
    const requests = readLocal(LOCAL_VENUE_KEY, []);
    writeLocal(
      LOCAL_VENUE_KEY,
      requests.map((item) => (item.id === request.id ? { ...item, ...request, status: 'approved' } : item))
    );
    return { id: request.id };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Du må være innlogget som moderator.');

  const venuePayload = {
    name: request.name,
    municipality: request.municipality,
    address: request.address || null,
    venue_type: request.venue_type || 'Flerbrukshall',
    is_outdoor: Boolean(request.is_outdoor),
    sport_tags: request.sport_tags || [],
    cover_emoji: request.is_outdoor ? '⚽' : '🏟️',
    status: 'approved',
    created_by: request.user_id || authData.user.id,
  };

  const { data: venue, error: venueError } = await supabase.from('venues').insert(venuePayload).select('*').single();
  if (venueError) throw venueError;

  const { error: requestError } = await supabase
    .from('venue_requests')
    .update({
      status: 'approved',
      venue_id: venue.id,
      processed_by: authData.user.id,
      processed_at: new Date().toISOString(),
    })
    .eq('id', request.id);
  if (requestError) throw requestError;

  return venue;
}

export async function rejectVenueRequest(requestId) {
  if (!hasSupabaseConfig) {
    const requests = readLocal(LOCAL_VENUE_KEY, []);
    writeLocal(LOCAL_VENUE_KEY, requests.map((request) => (request.id === requestId ? { ...request, status: 'rejected' } : request)));
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error('Du må være innlogget som moderator.');

  const { error } = await supabase
    .from('venue_requests')
    .update({ status: 'rejected', processed_by: authData.user.id, processed_at: new Date().toISOString() })
    .eq('id', requestId);
  if (error) throw error;
}
