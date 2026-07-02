import { useEffect, useMemo, useState } from 'react';
import {
  archiveVenue,
  approveVenueRequest,
  fetchPendingModeration,
  fetchReviews,
  fetchVenues,
  getDemoUser,
  getSession,
  hasSupabaseConfig,
  hideReview,
  listenToAuth,
  rejectFacilityReport,
  rejectVenueRequest,
  signInWithUsernamePassword,
  signOut,
  signUpWithUsernamePassword,
  submitFacilityReport,
  submitReview,
  submitVenueRequest,
} from './lib/api';

const ICON_VERSION = '20260702-gladrompe-all';
const GLAD_RUMPE_ICON_SRC = `/assets/glad-rumpe-icon.png?v=${ICON_VERSION}`;
const RUMPE_ICON = 'gladrompe';

const RATING_SCALES = {
  seating: [
    { value: 1, label: 'Rumpeknekker', emoji: '😫' },
    { value: 2, label: 'Nummen etter ti minutter', emoji: '😬' },
    { value: 3, label: 'Standard tribuneliv', emoji: '😐' },
    { value: 4, label: 'Foreldrevennlig', emoji: '🙂' },
    { value: 5, label: 'Sofa-følelse', emoji: '😎' },
  ],
  view: [
    { value: 1, label: 'Ser mest bakhoder', emoji: '🙈' },
    { value: 2, label: 'Stolpe-TV', emoji: '🧱' },
    { value: 3, label: 'Greit overblikk', emoji: '👀' },
    { value: 4, label: 'Speiderplass', emoji: '🔭' },
    { value: 5, label: 'VAR-rommet', emoji: '📺' },
  ],
  temperature: [
    { value: 1, label: 'Fryseboks med fløyte', emoji: '🥶' },
    { value: 2, label: 'Litt hallgufs', emoji: '🧥' },
    { value: 3, label: 'Helt greit', emoji: '😐' },
    { value: 4, label: 'Behagelig inneklima', emoji: '🙂' },
    { value: 5, label: 'Tropisk tribune', emoji: '🌴' },
  ],
  noise: [
    { value: 1, label: 'Trommehinnetesteren', emoji: '📣' },
    { value: 2, label: 'Hallbråk deluxe', emoji: '🔊' },
    { value: 3, label: 'Vanlig kamplyd', emoji: '😐' },
    { value: 4, label: 'Overraskende levelig', emoji: '🙂' },
    { value: 5, label: 'Akustisk mirakel', emoji: '✨' },
  ],
  weather: [
    { value: 1, label: 'Rett i fleisen', emoji: '🌧️' },
    { value: 2, label: 'Hetta må opp', emoji: '🧥' },
    { value: 3, label: 'Norsk standard', emoji: '☁️' },
    { value: 4, label: 'Godt skjermet', emoji: '☔' },
    { value: 5, label: 'Værgudene stoppes her', emoji: '😎' },
  ],
  ground: [
    { value: 1, label: 'Myrvandring', emoji: '🫠' },
    { value: 2, label: 'Grus i alt', emoji: '🥾' },
    { value: 3, label: 'Helt greit underlag', emoji: '😐' },
    { value: 4, label: 'Rent og ryddig', emoji: '🙂' },
    { value: 5, label: 'Rød løper-følelse', emoji: '🏆' },
  ],
  lighting: [
    { value: 1, label: 'Skyggekamp', emoji: '🌑' },
    { value: 2, label: 'Halvmørk dugnad', emoji: '🌘' },
    { value: 3, label: 'Greit lys', emoji: '💡' },
    { value: 4, label: 'Godt opplyst', emoji: '🔦' },
    { value: 5, label: 'Stadionlys', emoji: '🏟️' },
  ],
  toilet: [
    { value: 1, label: 'Mangler toalett', emoji: '😱' },
    { value: 2, label: 'Do finnes, men langt å gå', emoji: '🚶' },
    { value: 3, label: 'Standard toalett', emoji: '😐' },
    { value: 4, label: 'Overraskende sivilisert', emoji: '🙂' },
    { value: 5, label: 'Porselensparadis', emoji: '😇' },
  ],
  wardrobe: [
    { value: 1, label: 'Pose på gulvet', emoji: '🧦' },
    { value: 2, label: 'Trangt og klamt', emoji: '😬' },
    { value: 3, label: 'Helt grei garderobe', emoji: '😐' },
    { value: 4, label: 'God plass', emoji: '🙂' },
    { value: 5, label: 'Luksusbenken', emoji: '🏆' },
  ],
  shower: [
    { value: 1, label: 'Tørrdusj', emoji: '🚱' },
    { value: 2, label: 'Lunkent håp', emoji: '🥶' },
    { value: 3, label: 'Dusj finnes', emoji: '😐' },
    { value: 4, label: 'Varmt nok', emoji: '🙂' },
    { value: 5, label: 'Spa etter kamp', emoji: '🚿' },
  ],
};

const KIOSK_OPTIONS = [
  'Tørrmunn-garanti',
  'Vaffelrykter',
  'Kaffe og dugnadsvaffel',
  'God pausemat',
  'Foreldrebuffet',
];

const PARKING_OPTIONS = [
  'Glem bil',
  'Parkerings-Tetris',
  'Standard kaos',
  'God plass',
  'VIP-forelder',
];

const REVIEW_CATEGORIES = {
  indoor: [
    { key: 'comfort_score', label: 'Sittekomfort', icon: RUMPE_ICON, scale: 'seating' },
    { key: 'view_score', label: 'Utsikt', icon: '👀', scale: 'view' },
    { key: 'temperature_score', label: 'Temperatur', icon: '🌡️', scale: 'temperature' },
    { key: 'accessibility_score', label: 'Lydnivå', icon: '🔊', scale: 'noise' },
  ],
  outdoor: [
    { key: 'comfort_score', label: 'Sittekomfort', icon: RUMPE_ICON, scale: 'seating' },
    { key: 'view_score', label: 'Utsikt', icon: '👀', scale: 'view' },
    { key: 'temperature_score', label: 'Værbeskyttelse', icon: '🌧️', scale: 'weather' },
    { key: 'accessibility_score', label: 'Underlag', icon: '🥾', scale: 'ground' },
  ],
};

const FACILITY_RATING_FIELDS = {
  indoor: [
    { key: 'facility_seat_comfort', label: 'Sittekomfort', icon: RUMPE_ICON, scale: 'seating' },
    { key: 'facility_view_quality', label: 'Utsikt', icon: '👀', scale: 'view' },
    { key: 'facility_heating_level', label: 'Temperatur', icon: '🌡️', scale: 'temperature' },
    { key: 'facility_noise_level', label: 'Lydnivå', icon: '🔊', scale: 'noise' },
    { key: 'facility_toilet_quality', label: 'Toalett', icon: '🚻', scale: 'toilet' },
    { key: 'facility_garderobe_quality', label: 'Garderobe', icon: '🎒', scale: 'wardrobe' },
    { key: 'facility_shower_quality', label: 'Dusj', icon: '🚿', scale: 'shower' },
  ],
  outdoor: [
    { key: 'facility_seat_comfort', label: 'Sittekomfort', icon: RUMPE_ICON, scale: 'seating' },
    { key: 'facility_view_quality', label: 'Utsikt', icon: '👀', scale: 'view' },
    { key: 'facility_heating_level', label: 'Værbeskyttelse', icon: '🌧️', scale: 'weather' },
    { key: 'facility_noise_level', label: 'Underlag', icon: '🥾', scale: 'ground' },
    { key: 'facility_accessibility', label: 'Flomlys / synlighet', icon: '💡', scale: 'lighting' },
    { key: 'facility_toilet_quality', label: 'Toalett', icon: '🚻', scale: 'toilet' },
  ],
};

const UNIFIED_RATING_FIELDS = {
  indoor: [
    { key: 'comfort_score', facilityKey: 'facility_seat_comfort', label: 'Sittekomfort', icon: RUMPE_ICON, scale: 'seating' },
    { key: 'view_score', facilityKey: 'facility_view_quality', label: 'Utsikt', icon: '👀', scale: 'view' },
    { key: 'temperature_score', facilityKey: 'facility_heating_level', label: 'Temperatur', icon: '🌡️', scale: 'temperature' },
    { key: 'accessibility_score', facilityKey: 'facility_noise_level', label: 'Lydnivå', icon: '🔊', scale: 'noise' },
    { key: 'facility_toilet_quality', label: 'Toalett', icon: '🚻', scale: 'toilet' },
    { key: 'facility_garderobe_quality', label: 'Garderobe', icon: '🎒', scale: 'wardrobe' },
    { key: 'facility_shower_quality', label: 'Dusj', icon: '🚿', scale: 'shower' },
  ],
  outdoor: [
    { key: 'comfort_score', facilityKey: 'facility_seat_comfort', label: 'Sittekomfort', icon: RUMPE_ICON, scale: 'seating' },
    { key: 'view_score', facilityKey: 'facility_view_quality', label: 'Utsikt', icon: '👀', scale: 'view' },
    { key: 'temperature_score', facilityKey: 'facility_heating_level', label: 'Værbeskyttelse', icon: '🌧️', scale: 'weather' },
    { key: 'accessibility_score', facilityKey: 'facility_noise_level', label: 'Underlag', icon: '🥾', scale: 'ground' },
    { key: 'facility_accessibility', label: 'Flomlys / synlighet', icon: '💡', scale: 'lighting' },
    { key: 'facility_toilet_quality', label: 'Toalett', icon: '🚻', scale: 'toilet' },
  ],
};

const FACILITY_DISPLAY_ROWS = {
  indoor: [
    { label: 'Tribune', emoji: '🪑', value: (facilities) => facilities.seating_type || 'Ikke registrert' },
    { label: 'Ryggstøtte', emoji: '🧍', value: (facilities) => yesNo(facilities.has_backrest) },
    { label: 'Sittekomfort', emoji: RUMPE_ICON, value: (facilities) => ratingLabel('seating', facilities.seat_comfort) },
    { label: 'Utsikt', emoji: '👀', value: (facilities) => ratingLabel('view', facilities.view_quality) },
    { label: 'Temperatur', emoji: '🌡️', value: (facilities) => ratingLabel('temperature', facilities.heating_level) },
    { label: 'Lydnivå', emoji: '🔊', value: (facilities) => ratingLabel('noise', facilities.noise_level) },
    { label: 'Toalett', emoji: '🚻', value: (facilities) => ratingLabel('toilet', facilities.toilet_quality) },
    { label: 'Garderobe', emoji: '🎒', value: (facilities) => ratingLabel('wardrobe', facilities.garderobe_quality) },
    { label: 'Dusj', emoji: '🚿', value: (facilities) => ratingLabel('shower', facilities.shower_quality) },
    { label: 'Kiosk / kaffe', emoji: '☕', value: (facilities) => kioskLabel(facilities.kiosk_status) },
    { label: 'Parkering', emoji: '🚗', value: (facilities) => parkingLabel(facilities.parking) },
  ],
  outdoor: [
    { label: 'Tribune/sidelinje', emoji: '🪑', value: (facilities) => facilities.seating_type || 'Ikke registrert' },
    { label: 'Ryggstøtte', emoji: '🧍', value: (facilities) => yesNo(facilities.has_backrest) },
    { label: 'Værbeskyttelse', emoji: '🌧️', value: (facilities) => ratingLabel('weather', facilities.heating_level) },
    { label: 'Underlag', emoji: '🥾', value: (facilities) => ratingLabel('ground', facilities.noise_level) },
    { label: 'Flomlys / synlighet', emoji: '💡', value: (facilities) => ratingLabel('lighting', facilities.accessibility) },
    { label: 'Utsikt', emoji: '👀', value: (facilities) => ratingLabel('view', facilities.view_quality) },
    { label: 'Toalett', emoji: '🚻', value: (facilities) => ratingLabel('toilet', facilities.toilet_quality) },
    { label: 'Kiosk / kaffe', emoji: '☕', value: (facilities) => kioskLabel(facilities.kiosk_status) },
    { label: 'Parkering', emoji: '🚗', value: (facilities) => parkingLabel(facilities.parking) },
  ],
};

function venueRatingKind(isOutdoor) {
  return isOutdoor ? 'outdoor' : 'indoor';
}

function ratingOptions(scaleKey) {
  return RATING_SCALES[scaleKey] || [];
}

function ratingLabel(scaleKey, value) {
  const numericValue = Math.max(1, Math.min(5, Number(value || 0)));
  return ratingOptions(scaleKey).find((option) => option.value === numericValue)?.label || 'Ikke registrert';
}

function kioskLabel(value) {
  const text = String(value || '').trim();
  if (!text || /^ukjent$/i.test(text)) return 'Vaffelrykter';
  if (KIOSK_OPTIONS.includes(text)) return text;
  if (/ingen|mangler/i.test(text)) return 'Tørrmunn-garanti';
  if (/cup|større/i.test(text)) return 'God pausemat';
  if (/åpen|dugnad|kiosk|kaffe/i.test(text)) return 'Kaffe og dugnadsvaffel';
  return text;
}

function parkingLabel(value) {
  const text = String(value || '').trim();
  if (!text || /^ukjent$/i.test(text)) return 'Standard kaos';
  if (PARKING_OPTIONS.includes(text)) return text;
  if (/ingen|umulig|gate|glem/i.test(text)) return 'Glem bil';
  if (/trang|begrenset|tetris/i.test(text)) return 'Parkerings-Tetris';
  if (/god|lett|stor|mye|masse/i.test(text)) return 'God plass';
  if (/middels|brukbar|ok|standard/i.test(text)) return 'Standard kaos';
  return text;
}

function makeEmptyReview() {
  return {
    venue_id: '',
    venue_municipality: '',
    user_name: '',
    tribunesliter_minutes: 25,
    comfort_score: 3,
    view_score: 3,
    temperature_score: 3,
    accessibility_score: 3,
    event_type: 'Kamp',
    visit_date: new Date().toISOString().slice(0, 10),
    comment: '',
    facility_seating_type: 'Trebenk',
    facility_seat_comfort: 3,
    facility_has_backrest: false,
    facility_heating_level: 3,
    facility_toilet_quality: 3,
    facility_garderobe_quality: 3,
    facility_shower_quality: 3,
    facility_kiosk_status: 'Vaffelrykter',
    facility_parking: 'Standard kaos',
    facility_accessibility: 3,
    facility_roof_cover: false,
    facility_view_quality: 3,
    facility_noise_level: 3,
    facility_notes: '',
    include_facilities: true,
  };
}

function makeFacilityReportFromVenue(venue) {
  const facilities = venue?.facilities || {};
  return {
    venue_id: venue?.id || '',
    venue_name: venue?.name || '',
    facility_seating_type: facilities.seating_type || 'Trebenk',
    facility_seat_comfort: Number(facilities.seat_comfort || 3),
    facility_has_backrest: Boolean(facilities.has_backrest),
    facility_heating_level: Number(facilities.heating_level || 3),
    facility_toilet_quality: Number(facilities.toilet_quality || 3),
    facility_garderobe_quality: Number(facilities.garderobe_quality || 3),
    facility_shower_quality: Number(facilities.shower_quality || 3),
    facility_kiosk_status: kioskLabel(facilities.kiosk_status),
    facility_parking: parkingLabel(facilities.parking),
    facility_accessibility: Number(facilities.accessibility || 3),
    facility_roof_cover: Boolean(facilities.roof_cover),
    facility_view_quality: Number(facilities.view_quality || 3),
    facility_noise_level: Number(facilities.noise_level || 3),
    facility_notes: facilities.notes || '',
  };
}

function makeReviewFormForVenue(venue, current = makeEmptyReview()) {
  const facilityValues = makeFacilityReportFromVenue(venue);
  const venueIsOutdoor = Boolean(venue?.is_outdoor);
  return {
    ...current,
    ...facilityValues,
    venue_id: venue?.id || current.venue_id || '',
    venue_municipality: venue?.municipality || current.venue_municipality || '',
    comfort_score: facilityValues.facility_seat_comfort,
    view_score: facilityValues.facility_view_quality,
    temperature_score: facilityValues.facility_heating_level,
    accessibility_score: venueIsOutdoor ? facilityValues.facility_noise_level : facilityValues.facility_noise_level,
    include_facilities: true,
  };
}

const emptyVenueRequest = {
  name: '',
  municipality: '',
  address: '',
  venue_type: 'Flerbrukshall',
  is_outdoor: false,
  notes: '',
};

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function InlineRumpeIcon({ className }) {
  return <img className={cx('inline-rumpe-icon', className)} src={GLAD_RUMPE_ICON_SRC} alt="" aria-hidden="true" />;
}

function IconGlyph({ icon, className }) {
  if (icon === RUMPE_ICON) return <InlineRumpeIcon className={className} />;
  return <span className={className}>{icon}</span>;
}

function RumpeText({ children }) {
  return <span className="rumpe-text">{children}<InlineRumpeIcon /></span>;
}

function userDisplayName(user, profile, fallback = 'tribunesliter') {
  return profile?.display_name || profile?.username || user?.user_metadata?.display_name || user?.user_metadata?.username || user?.email?.split('@')[0] || fallback;
}

function shortDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('no-NO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

function scoreLabel(value) {
  const number = Number(value || 0);
  if (!number) return 'Ikke registrert';
  if (number <= 2) return 'Svakt';
  if (number === 3) return 'Middels';
  return 'Bra';
}

function yesNo(value) {
  if (value === true) return 'Ja';
  if (value === false) return 'Nei';
  return 'Ukjent';
}

function stars(value) {
  const number = Math.max(0, Math.min(5, Number(value || 0)));
  if (!number) return 'Ikke registrert';
  return '★'.repeat(number) + '☆'.repeat(5 - number);
}

function deriveTribunesliterLabel(minutes) {
  const value = Number(minutes || 0);
  if (!value) return 'Ingen vurderinger ennå.';
  if (value <= 15) return 'Putealarm. Dette er karakterbyggende.';
  if (value <= 25) return 'Kort kamp går fint. Cup blir risikosport.';
  if (value <= 40) return 'Godkjent sitteplass for vanlige folk.';
  return 'Luksusnivå. Her kan besteforeldre overleve sluttspill.';
}

function scoreFromMinutes(minutes) {
  const value = Number(minutes || 0);
  if (!value) return 0;
  return Math.max(18, Math.min(96, Math.round((value / 55) * 100)));
}

function primarySport(venue) {
  return venue?.sport_tags?.[0] || 'Idrett ikke registrert';
}

function cushionAlarm(venue) {
  const facilities = venue?.facilities || {};
  return Number(venue?.tribunesliter_minutes || 0) <= 24 || Number(facilities.seat_comfort || 0) <= 2 || /trebenk|betong|stå|ingen/i.test(facilities.seating_type || '');
}

function venueTone(venue) {
  return venue?.is_outdoor ? 'blue' : cushionAlarm(venue) ? 'amber' : 'green';
}

function statusLines(venue) {
  const facilities = venue?.facilities || {};
  const lines = [];
  if (cushionAlarm(venue)) lines.push('🪑 Pute anbefalt');
  else lines.push('✅ Snill mot rumpa');
  if (venue?.is_outdoor) lines.push('🧥 Kle deg for sidelinje');
  else if ((facilities.kiosk_status || '').toLowerCase().includes('kiosk') || facilities.kiosk_status) lines.push('🧇 Kiosk');
  if (Number(venue?.tribunesliter_minutes || 0)) lines.push(`Holder ~${venue.tribunesliter_minutes} min`);
  else lines.push('Mangler vurderinger');
  return lines.slice(0, 3);
}

function facilityEmoji(label) {
  const key = label.toLowerCase();
  if (key.includes('tribune')) return '🪑';
  if (key.includes('rygg')) return '🧍';
  if (key.includes('tak')) return '☔';
  if (key.includes('sitte')) return RUMPE_ICON;
  if (key.includes('varme')) return '🌡️';
  if (key.includes('kiosk')) return '🧇';
  if (key.includes('parkering')) return '🅿️';
  if (key.includes('toalett')) return '🚻';
  if (key.includes('tilgjeng')) return '♿';
  if (key.includes('sikt')) return '👀';
  if (key.includes('støy')) return '🔊';
  return '•';
}

function canModerate(profile, mode) {
  return mode === 'demo' || profile?.role === 'moderator' || profile?.role === 'admin';
}

const quickTags = ['🪑 Ta med pute', '🧥 Kle deg varmt', '🧇 Kiosk verdt køen', '🥶 Kaldere enn forventet', '👀 God sikt', '🅿️ Lett parkering'];
const SAVED_VENUES_KEY = 'tribunesliter.savedVenues.v1';
const RECENT_VENUES_KEY = 'tribunesliter.recentVenues.v1';
const INSTALL_HINT_DISMISSED_KEY = 'tribunesliter.installHint.dismissed.v1';
const BADGE_PROGRESS_KEY = 'tribunesliter.badgeProgress.v1';
const APP_REQUEST_TIMEOUT_MS = 12000;
const MAX_COMMENT_LENGTH = 500;
const MAX_NOTES_LENGTH = 500;

const BADGE_DEFINITIONS = [
  { id: 'startfløyta', icon: '🎺', title: 'Startfløyta', description: 'Første sjekk-inn er levert.', metric: 'checkIns', target: 1 },
  { id: 'benkevarmer', icon: '🪑', title: 'Benkevarmer', description: '3 baner ratet. Rumpa begynner å få erfaring.', metric: 'checkIns', target: 3 },
  { id: 'rumpekompass', icon: RUMPE_ICON, title: 'Rumpekompasset', description: '10 sjekk-ins. Du finner benkekvalitet i blinde.', metric: 'checkIns', target: 10 },
  { id: 'banesliter', icon: '🏟️', title: 'Banesliter', description: '25 sjekk-ins. Lokalidrettens uoffisielle sitteekspert.', metric: 'checkIns', target: 25 },
  { id: 'vaffelvarsler', icon: '🧇', title: 'Vaffelvarsler', description: '3 fasilitetsbidrag om kiosk, do eller parkering.', metric: 'facilityReports', target: 3 },
  { id: 'kartfikser', icon: '🗺️', title: 'Kartfikser', description: 'Foreslått et manglende anlegg.', metric: 'venueRequests', target: 1 },
  { id: 'treplanketemmeren', icon: '🪵', title: 'Treplanketemmeren', description: '5 utendørsbaner vurdert. Du har overlevd mer trebenk enn kroppen anbefaler.', metric: 'outdoorReviews', target: 5 },
  { id: 'hallstølen', icon: '🏐', title: 'Hallstølen', description: '5 innendørsanlegg vurdert. Ribbevegg, klappstol og betongtribune er kartlagt.', metric: 'indoorReviews', target: 5 },
  { id: 'kioskprofeten', icon: '🌭', title: 'Kioskprofeten', description: '5 kioskvurderinger. Du lukter vaffelplate på 300 meters avstand.', metric: 'kioskReports', target: 5 },
  { id: 'dopatruljen', icon: '🚽', title: 'Dopatruljen', description: '5 toalettvurderinger. Ingen kampdag uten strategisk do-kartlegging.', metric: 'toiletReports', target: 5 },
  { id: 'parkeringsorakelet', icon: '🅿️', title: 'Parkeringsorakelet', description: '5 parkeringsvurderinger. Bil, sykkel eller bare gi opp?', metric: 'parkingReports', target: 5 },
  { id: 'førsteradstraumet', icon: '👀', title: 'Førsteradstraumet', description: '3 vurderinger med dårlig sikt. Du har sett mer rygg enn kamp.', metric: 'badViewReviews', target: 3 },
  { id: 'betongrumpa', icon: '🪨', title: 'Betongrumpa', description: '10 dårlige sitteplassvurderinger. Smerteterskelen er ikke normal lenger.', metric: 'badSeatReviews', target: 10 },
  { id: 'putemisjonæren', icon: '🛋️', title: 'Putemisjonæren', description: '10 sitteplassvurderinger. Ta med pute. Alltid.', metric: 'seatingReports', target: 10 },
  { id: 'langturlegenden', icon: '🚗', title: 'Langturlegenden', description: '10 ulike anlegg vurdert. Mer tid i bil enn på selve kampen.', metric: 'uniqueVenues', target: 10 },
  { id: 'lokalkjent', icon: '🧭', title: 'Lokalkjent', description: '10 anlegg i samme kommune/område. Du kan snart guide bortelaget.', metric: 'bestMunicipalityCount', target: 10 },
  { id: 'bortebanehelten', icon: '🚌', title: 'Bortebanehelten', description: '15 ulike anlegg vurdert. Dugnadskaffe på tvers av kommuner.', metric: 'uniqueVenues', target: 15 },
  { id: 'kveldskampkrigeren', icon: '🌙', title: 'Kveldskampkrigeren', description: 'Vurdering sendt etter kl. 20. Du fryser, men rapporterer fortsatt.', metric: 'lateReviews', target: 1 },
  { id: 'regnponcho-ridderen', icon: '🌧️', title: 'Regnponcho-ridderen', description: 'Vær, regn eller vind er rapportert. Frivillig. Nesten.', metric: 'weatherWarriorReviews', target: 1 },
  { id: 'vaffelvarsler-deluxe', icon: '🧇', title: 'Vaffelvarsler Deluxe', description: '10 fasilitetsbidrag. Appens uoffisielle kiosktilsyn.', metric: 'facilityReports', target: 10 },
  { id: 'glem-bil', icon: '🚶', title: 'Glem bil', description: '3 parkeringsvurderinger med dårligste alternativ. Folket er advart.', metric: 'noCarParkingReviews', target: 3 },
  { id: 'sitteplass-sheriffen', icon: '🤠', title: 'Sitteplass-sheriffen', description: '25 sitteplassvurderinger. Patruljerer tribuner med øm korsrygg.', metric: 'seatingReports', target: 25 },
  { id: 'mini-arkitekten', icon: '🏗️', title: 'Mini-arkitekten', description: '5 manglende anlegg foreslått. Kartet bygges én sliten tribune av gangen.', metric: 'venueRequests', target: 5 },
  { id: 'førstemann-på-plass', icon: '⏱️', title: 'Førstemann på plass', description: 'Første vurdering på et nytt anlegg. Noen måtte teste benken først.', metric: 'firstReviews', target: 1 },
  { id: 'folkets-rumpeombud', icon: RUMPE_ICON, title: 'Folkets rumpeombud', description: '50 vurderinger totalt. Taler sitteflatenes sak i hele landet.', metric: 'checkIns', target: 50 },
  { id: 'tribunesliter-elite', icon: '🏆', title: 'Tribunesliter Elite', description: '100 vurderinger totalt. På dette nivået bør du få egen klappstol.', metric: 'checkIns', target: 100 },
  { id: 'aldri-igjen', icon: '💀', title: 'Aldri igjen', description: 'Laveste vurdering på alt ved ett anlegg. Dette anlegget er nå offisielt en prøvelse.', metric: 'allBadReviews', target: 1, hidden: true },
  { id: 'overraskende-bra', icon: '✨', title: 'Overraskende bra', description: 'Toppvurdering på et lite vurdert anlegg. Noen ganger leverer bortebanen.', metric: 'perfectSmallVenueReviews', target: 1, hidden: true },
  { id: 'kald-kaffe-klubben', icon: '☕', title: 'Kald kaffe-klubben', description: 'Kommentar som nevner kaffe, kiosk eller vaffel. Temperaturen diskuteres.', metric: 'coffeeComments', target: 1, hidden: true },
  { id: 'rompe-mot-nordavind', icon: '🥶', title: 'Rompe mot nordavind', description: 'Kommentar som nevner kulde, vind eller frysing. Du satt ute for fellesskapet.', metric: 'coldWeatherComments', target: 1, hidden: true },
  { id: 'dommerens-skyld', icon: '🟨', title: 'Dommerens skyld', description: 'Kommentar som nevner dommer. Badgen deles ut automatisk, uansett om det stemmer.', metric: 'refereeComments', target: 1, hidden: true },
];

const BADGE_PROGRESS_DEFAULTS = {
  checkIns: 0,
  facilityReports: 0,
  venueRequests: 0,
  outdoorReviews: 0,
  indoorReviews: 0,
  kioskReports: 0,
  toiletReports: 0,
  parkingReports: 0,
  badViewReviews: 0,
  badSeatReviews: 0,
  seatingReports: 0,
  lateReviews: 0,
  weatherWarriorReviews: 0,
  noCarParkingReviews: 0,
  firstReviews: 0,
  allBadReviews: 0,
  perfectSmallVenueReviews: 0,
  coffeeComments: 0,
  coldWeatherComments: 0,
  refereeComments: 0,
  uniqueVenueIds: [],
  municipalityCounts: {},
  municipalityVenueIds: {},
};

function timeoutAfter(message, ms = APP_REQUEST_TIMEOUT_MS) {
  return new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error(message)), ms);
  });
}

function withTimeout(promise, message, ms) {
  return Promise.race([promise, timeoutAfter(message, ms)]);
}

function sanitizeBadgeProgress(progress = {}) {
  const next = { ...BADGE_PROGRESS_DEFAULTS, ...(progress || {}) };
  next.uniqueVenueIds = Array.isArray(next.uniqueVenueIds) ? next.uniqueVenueIds.filter(Boolean) : [];
  next.municipalityCounts = next.municipalityCounts && typeof next.municipalityCounts === 'object' && !Array.isArray(next.municipalityCounts)
    ? next.municipalityCounts
    : {};
  next.municipalityVenueIds = next.municipalityVenueIds && typeof next.municipalityVenueIds === 'object' && !Array.isArray(next.municipalityVenueIds)
    ? next.municipalityVenueIds
    : {};
  Object.entries(next.municipalityVenueIds).forEach(([municipality, ids]) => {
    next.municipalityVenueIds[municipality] = Array.isArray(ids) ? ids.filter(Boolean) : [];
  });
  return next;
}

function readBadgeProgress() {
  if (typeof window === 'undefined') return sanitizeBadgeProgress();
  try {
    return sanitizeBadgeProgress(JSON.parse(window.localStorage.getItem(BADGE_PROGRESS_KEY) || '{}') || {});
  } catch {
    return sanitizeBadgeProgress();
  }
}

function badgeValue(progress, badge) {
  const safeProgress = sanitizeBadgeProgress(progress);
  if (badge.metric === 'uniqueVenues') return safeProgress.uniqueVenueIds.length;
  if (badge.metric === 'bestMunicipalityCount') {
    const uniqueCounts = Object.values(safeProgress.municipalityVenueIds || {}).map((ids) => Array.isArray(ids) ? ids.length : 0);
    if (uniqueCounts.length) return Math.max(0, ...uniqueCounts);
    return Math.max(0, ...Object.values(safeProgress.municipalityCounts || {}).map((value) => Number(value || 0)));
  }
  return Number(safeProgress?.[badge.metric] || 0);
}

function mergeBadgeProgress(current, patch = {}) {
  const next = sanitizeBadgeProgress(current);
  Object.entries(patch || {}).forEach(([key, value]) => {
    if (key === 'uniqueVenueIds') {
      const incoming = Array.isArray(value) ? value : [value];
      next.uniqueVenueIds = [...new Set([...next.uniqueVenueIds, ...incoming.filter(Boolean)])];
      return;
    }
    if (key === 'municipalityCounts') {
      Object.entries(value || {}).forEach(([municipality, count]) => {
        if (!municipality) return;
        next.municipalityCounts[municipality] = Number(next.municipalityCounts[municipality] || 0) + Number(count || 0);
      });
      return;
    }
    if (key === 'municipalityVenueIds') {
      Object.entries(value || {}).forEach(([municipality, ids]) => {
        if (!municipality) return;
        const incoming = Array.isArray(ids) ? ids : [ids];
        next.municipalityVenueIds[municipality] = [...new Set([...(next.municipalityVenueIds[municipality] || []), ...incoming.filter(Boolean)])];
      });
      return;
    }
    next[key] = Number(next[key] || 0) + Number(value || 0);
  });
  return next;
}

function textMatches(value, pattern) {
  return pattern.test(String(value || '').toLowerCase());
}

function isBadSeating(form) {
  return Number(form?.comfort_score || form?.facility_seat_comfort || 0) <= 2
    || Number(form?.facility_seat_comfort || 0) <= 2
    || textMatches(form?.facility_seating_type, /betong|stå|ingen|hard|vond|dårlig/);
}

function isBadView(form) {
  return Number(form?.view_score || 0) <= 2 || Number(form?.facility_view_quality || 0) <= 2;
}

function isWeatherWarrior(form, venueIsOutdoor) {
  if (!venueIsOutdoor) return false;
  return Number(form?.temperature_score || 0) <= 2
    || Number(form?.facility_heating_level || 0) <= 2
    || textMatches(`${form?.comment || ''} ${form?.facility_notes || ''}`, /regn|vått|våt|kald|frys|vind|storm|snø|sludd/);
}

function isColdWeatherComment(form) {
  return textMatches(`${form?.comment || ''} ${form?.facility_notes || ''}`, /kald|frys|vind|nordavind|snø|sludd/);
}

function isCoffeeComment(form) {
  return textMatches(`${form?.comment || ''} ${form?.facility_notes || ''} ${form?.facility_kiosk_status || ''}`, /kaffe|kiosk|vaffel|kake|pølse/);
}

function isRefereeComment(form) {
  return textMatches(form?.comment, /dommer|dømming|gult kort|rødt kort|frispark|straffe/);
}

function isAllBadReview(form) {
  const mainScores = [form?.comfort_score, form?.view_score, form?.temperature_score, form?.accessibility_score].map(Number);
  if (!mainScores.every((value) => value === 1)) return false;
  if (!form?.include_facilities) return true;
  const facilityScores = [form?.facility_seat_comfort, form?.facility_view_quality, form?.facility_heating_level, form?.facility_toilet_quality].map(Number);
  return facilityScores.every((value) => value === 1) && parkingLabel(form?.facility_parking) === 'Glem bil';
}

function isPerfectReview(form) {
  const scores = [form?.comfort_score, form?.view_score, form?.temperature_score, form?.accessibility_score].map(Number);
  return scores.every((value) => value === 5);
}

function buildReviewBadgeProgressPatch(form, venue) {
  const venueIsOutdoor = Boolean(venue?.is_outdoor);
  const venueId = form?.venue_id || venue?.id || '';
  const municipality = venue?.municipality || form?.venue_municipality || '';
  const includeFacilities = Boolean(form?.include_facilities);
  const patch = {
    checkIns: 1,
    seatingReports: 1,
    uniqueVenueIds: venueId ? [venueId] : [],
    municipalityCounts: municipality ? { [municipality]: 1 } : {},
    municipalityVenueIds: municipality && venueId ? { [municipality]: [venueId] } : {},
    outdoorReviews: venueIsOutdoor ? 1 : 0,
    indoorReviews: venueIsOutdoor ? 0 : 1,
    badSeatReviews: isBadSeating(form) ? 1 : 0,
    badViewReviews: isBadView(form) ? 1 : 0,
    weatherWarriorReviews: isWeatherWarrior(form, venueIsOutdoor) ? 1 : 0,
    lateReviews: new Date().getHours() >= 20 ? 1 : 0,
    firstReviews: Number(venue?.review_count || 0) === 0 ? 1 : 0,
    allBadReviews: isAllBadReview(form) ? 1 : 0,
    perfectSmallVenueReviews: isPerfectReview(form) && Number(venue?.review_count || 0) <= 1 ? 1 : 0,
    coffeeComments: isCoffeeComment(form) ? 1 : 0,
    coldWeatherComments: isColdWeatherComment(form) ? 1 : 0,
    refereeComments: isRefereeComment(form) ? 1 : 0,
  };

  if (includeFacilities) {
    patch.facilityReports = 1;
    patch.kioskReports = form?.facility_kiosk_status ? 1 : 0;
    patch.toiletReports = Number(form?.facility_toilet_quality || 0) ? 1 : 0;
    patch.parkingReports = form?.facility_parking ? 1 : 0;
    patch.noCarParkingReviews = parkingLabel(form?.facility_parking) === 'Glem bil' ? 1 : 0;
  }

  return patch;
}

function buildFacilityBadgeProgressPatch(form, venue) {
  const venueIsOutdoor = Boolean(venue?.is_outdoor);
  return {
    facilityReports: 1,
    seatingReports: 1,
    kioskReports: form?.facility_kiosk_status ? 1 : 0,
    toiletReports: Number(form?.facility_toilet_quality || 0) ? 1 : 0,
    parkingReports: form?.facility_parking ? 1 : 0,
    noCarParkingReviews: parkingLabel(form?.facility_parking) === 'Glem bil' ? 1 : 0,
    badSeatReviews: isBadSeating(form) ? 1 : 0,
    badViewReviews: isBadView(form) ? 1 : 0,
    weatherWarriorReviews: isWeatherWarrior(form, venueIsOutdoor) ? 1 : 0,
    coffeeComments: isCoffeeComment(form) ? 1 : 0,
    coldWeatherComments: isColdWeatherComment(form) ? 1 : 0,
  };
}

function errorMessage(error, fallback = 'Ukjent feil.') {
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
  return fallback;
}

export default function App() {
  const [view, setView] = useState('home');
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [municipalityFilter, setMunicipalityFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [sortMode, setSortMode] = useState('score');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState(hasSupabaseConfig ? 'supabase' : 'demo');
  const [reviewForm, setReviewForm] = useState(makeEmptyReview);
  const [facilityForm, setFacilityForm] = useState(() => makeFacilityReportFromVenue(null));
  const [venueRequest, setVenueRequest] = useState(emptyVenueRequest);
  const [moderation, setModeration] = useState({ reviews: [], approvedReviews: [], facilityReports: [], venueRequests: [] });
  const [adminBusy, setAdminBusy] = useState('');
  const [badgeProgress, setBadgeProgress] = useState(readBadgeProgress);
  const [savedVenueIds, setSavedVenueIds] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem(SAVED_VENUES_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [recentVenueIds, setRecentVenueIds] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(window.localStorage.getItem(RECENT_VENUES_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installHintDismissed, setInstallHintDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(INSTALL_HINT_DISMISSED_KEY) === '1';
  });

  useEffect(() => {
    let mounted = true;
    async function boot() {
      try {
        const [sessionResult, venuesResult] = await Promise.allSettled([
          withTimeout(getSession(), 'Innlogging tok for lang tid. Prøv å oppdatere siden.'),
          withTimeout(fetchVenues(), 'Klarte ikke hente haller fra Supabase. Sjekk nettverk eller prøv igjen.'),
        ]);
        if (!mounted) return;

        const notices = [];
        if (sessionResult.status === 'fulfilled') {
          setUser(sessionResult.value.user || getDemoUser());
          setProfile(sessionResult.value.profile || null);
          setMode(sessionResult.value.mode);
        } else {
          setUser(getDemoUser());
          setProfile(null);
          notices.push(errorMessage(sessionResult.reason));
        }

        if (venuesResult.status === 'fulfilled') {
          const venueRows = venuesResult.value;
          setVenues(venueRows);
          setSelectedVenueId((current) => current || venueRows[0]?.id || null);
        } else {
          setVenues([]);
          notices.push(errorMessage(venuesResult.reason));
        }

        if (notices.length) setNotice(notices.join(' '));
      } catch (error) {
        setNotice(errorMessage(error));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    boot();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let unlisten = () => {};
    listenToAuth(({ user: nextUser, profile: nextProfile }) => {
      setUser(nextUser);
      setProfile(nextProfile);
    }).then((fn) => {
      unlisten = fn;
    });
    return () => unlisten();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_VENUES_KEY, JSON.stringify(savedVenueIds));
    } catch {
      // localStorage may be unavailable in private browsing. Saved venues are optional.
    }
  }, [savedVenueIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(RECENT_VENUES_KEY, JSON.stringify(recentVenueIds));
    } catch {
      // Recent venues are only a local convenience.
    }
  }, [recentVenueIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(BADGE_PROGRESS_KEY, JSON.stringify(badgeProgress));
    } catch {
      // Badge progress is local encouragement, not critical state.
    }
  }, [badgeProgress]);

  useEffect(() => {
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const selectedVenue = useMemo(
    () => venues.find((venue) => venue.id === selectedVenueId) || venues[0],
    [venues, selectedVenueId]
  );

  const savedVenues = useMemo(
    () => venues.filter((venue) => savedVenueIds.includes(venue.id)),
    [venues, savedVenueIds]
  );

  const recentVenues = useMemo(
    () => recentVenueIds.map((id) => venues.find((venue) => venue.id === id)).filter(Boolean).slice(0, 4),
    [venues, recentVenueIds]
  );

  const municipalities = useMemo(
    () => [...new Set(venues.map((venue) => venue.municipality).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'nb')),
    [venues]
  );

  const sports = useMemo(
    () => [...new Set(venues.flatMap((venue) => venue.sport_tags || []))].sort((a, b) => a.localeCompare(b, 'nb')),
    [venues]
  );

  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return venues
      .filter((venue) => {
        const matchesFilter =
          filter === 'all' ||
          (filter === 'indoor' && !venue.is_outdoor) ||
          (filter === 'outdoor' && venue.is_outdoor) ||
          (filter === 'rated' && Number(venue.review_count || 0) > 0) ||
          (filter === 'needsData' && Number(venue.review_count || 0) === 0) ||
          (filter === 'cushion' && cushionAlarm(venue)) ||
          (filter === 'kiosk' && Boolean(venue.facilities?.kiosk_status));
        const matchesMunicipality = municipalityFilter === 'all' || venue.municipality === municipalityFilter;
        const matchesSport = sportFilter === 'all' || (venue.sport_tags || []).includes(sportFilter);
        const searchable = [venue.name, venue.municipality, venue.address, venue.venue_type, ...(venue.sport_tags || [])]
          .join(' ')
          .toLowerCase();
        return matchesFilter && matchesMunicipality && matchesSport && (!normalizedQuery || searchable.includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (sortMode === 'score') return scoreFromMinutes(b.tribunesliter_minutes) - scoreFromMinutes(a.tribunesliter_minutes);
        if (sortMode === 'reviews') return Number(b.review_count || 0) - Number(a.review_count || 0);
        if (sortMode === 'municipality') return `${a.municipality} ${a.name}`.localeCompare(`${b.municipality} ${b.name}`, 'nb');
        return a.name.localeCompare(b.name, 'nb');
      });
  }, [venues, query, filter, municipalityFilter, sportFilter, sortMode]);

  useEffect(() => {
    if (!selectedVenue?.id) return;
    withTimeout(fetchReviews(selectedVenue.id), 'Klarte ikke hente vurderinger akkurat nå.')
      .then(setReviews)
      .catch((error) => setNotice(errorMessage(error)));
  }, [selectedVenue?.id]);

  function go(nextView, venueId) {
    if (venueId) setSelectedVenueId(venueId);
    if (nextView === 'rate' && venueId) {
      const venue = venues.find((item) => item.id === venueId);
      setReviewForm((current) => ({
        ...current,
        venue_id: venueId,
        venue_municipality: venue?.municipality || current.venue_municipality,
      }));
    }
    if (nextView === 'venue' && venueId) {
      setRecentVenueIds((current) => [venueId, ...current.filter((id) => id !== venueId)].slice(0, 6));
    }
    setNotice('');
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleSavedVenue(venueId) {
    if (!venueId) return;
    setSavedVenueIds((current) => {
      const exists = current.includes(venueId);
      const next = exists ? current.filter((id) => id !== venueId) : [...current, venueId];
      const venueName = venues.find((venue) => venue.id === venueId)?.name || 'Anlegget';
      setNotice(exists ? `${venueName} er fjernet fra lagret.` : `${venueName} er lagret på denne enheten.`);
      return next;
    });
  }

  function addBadgeProgress(patch) {
    setBadgeProgress((current) => mergeBadgeProgress(current, patch));
  }

  async function shareVenue(venue) {
    if (!venue) return;
    const url = window.location.href.split('#')[0];
    const text = `${venue.name} på Tribunesliter · ${deriveTribunesliterLabel(venue.tribunesliter_minutes || 0)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Tribunesliter: ${venue.name}`, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setNotice('Lenke kopiert.');
    } catch {
      setNotice('Deling ble avbrutt.');
    }
  }

  async function installApp() {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice.catch(() => null);
      setInstallPrompt(null);
      setNotice('Installasjonsvinduet er åpnet.');
      return;
    }
    setNotice('På iPhone: åpne i Safari → Del → Legg til på Hjem-skjerm. På Android: menyen i nettleseren → Installer app / Legg til på startskjerm.');
  }

  function dismissInstallHint() {
    setInstallHintDismissed(true);
    window.localStorage.setItem(INSTALL_HINT_DISMISSED_KEY, '1');
  }

  async function refreshVenues() {
    const rows = await fetchVenues();
    setVenues(rows);
    return rows;
  }

  async function refreshModeration() {
    const rows = await fetchPendingModeration();
    setModeration(rows);
    return rows;
  }

  async function handleLogin({ username, password, authMode }) {
    setAuthBusy(true);
    setNotice(authMode === 'signup' ? 'Oppretter bruker...' : 'Logger inn...');
    try {
      const action = authMode === 'signup' ? signUpWithUsernamePassword : signInWithUsernamePassword;
      const result = await action(username, password);
      if (result.user && !result.needsConfirmation) {
        setUser(result.user);
        setProfile(result.profile);
      }
      if (result.needsConfirmation) {
        setUser(null);
        setProfile(null);
        console.warn('Supabase sign-up returned a user without an active session. Check Email confirmation settings for username/password signup.');
        setNotice('Kontoen ble opprettet, men er ikke klar for innlogging ennå. Kontakt administrator.');
      } else {
        setNotice(authMode === 'signup' ? 'Bruker opprettet og innlogget.' : 'Du er logget inn.');
      }
    } catch (error) {
      setNotice(errorMessage(error, 'Vi klarte ikke å fullføre handlingen akkurat nå. Prøv igjen litt senere.'));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    setProfile(null);
    setNotice('Du er logget ut.');
  }

  async function handleSubmitReview(event) {
    event.preventDefault();
    const targetVenueId = reviewForm.venue_id || selectedVenue?.id;
    if (!targetVenueId) {
      setNotice('Velg anlegg først.');
      return;
    }
    if (!reviewForm.user_name.trim()) {
      setNotice('Skriv inn navn eller kallenavn før du sender vurderingen.');
      return;
    }

    try {
      const targetVenue = venues.find((venue) => venue.id === targetVenueId) || selectedVenue;
      const payload = { ...reviewForm, venue_id: targetVenueId, venue_municipality: targetVenue?.municipality || reviewForm.venue_municipality };
      await submitReview(payload);
      await refreshVenues();
      setReviews(await fetchReviews(targetVenueId));
      setSelectedVenueId(targetVenueId);
      addBadgeProgress(buildReviewBadgeProgressPatch(payload, targetVenue));
      setReviewForm(makeEmptyReview());
      setNotice('Vurderingen er publisert. Takk for bidraget!');
      go('thanks', targetVenueId);
    } catch (error) {
      setNotice(errorMessage(error));
    }
  }

  async function handleSubmitFacilityReport(event) {
    event.preventDefault();
    const targetVenueId = facilityForm.venue_id || selectedVenue?.id;
    if (!targetVenueId) {
      setNotice('Velg anlegg først.');
      return;
    }
    try {
      const targetVenue = venues.find((venue) => venue.id === targetVenueId) || selectedVenue;
      const payload = { ...facilityForm, venue_id: targetVenueId, venue_name: targetVenue?.name || facilityForm.venue_name };
      await submitFacilityReport(payload);
      setFacilityForm(makeFacilityReportFromVenue(targetVenue));
      addBadgeProgress(buildFacilityBadgeProgressPatch(payload, targetVenue));
      await refreshVenues();
      go('venue', targetVenueId);
      setNotice('Fasilitetsinfo er publisert. Takk for ryddingen!');
    } catch (error) {
      setNotice(errorMessage(error));
    }
  }

  async function handleSubmitVenueRequest(event) {
    event.preventDefault();
    if (!user && hasSupabaseConfig) {
      setNotice('Du må logge inn før du kan foreslå nytt anlegg.');
      go('profile');
      return;
    }

    try {
      await submitVenueRequest(venueRequest);
      setVenueRequest(emptyVenueRequest);
      addBadgeProgress({ venueRequests: 1 });
      go('home');
      setNotice('Forslaget er lagret og må godkjennes før det vises offentlig.');
    } catch (error) {
      setNotice(errorMessage(error));
    }
  }

  async function loadModeration() {
    if (!canModerate(profile, mode)) {
      setNotice('Du må ha moderator- eller adminrolle for å åpne moderering.');
      return;
    }
    try {
      await refreshModeration();
      go('admin');
    } catch (error) {
      setNotice(errorMessage(error));
    }
  }

  async function runAdminAction(key, action, successMessage) {
    try {
      setAdminBusy(key);
      await action();
      await refreshModeration();
      const updatedVenues = await refreshVenues();
      if (selectedVenueId && updatedVenues.some((venue) => venue.id === selectedVenueId)) {
        setReviews(await fetchReviews(selectedVenueId));
      } else if (selectedVenueId) {
        setSelectedVenueId(updatedVenues[0]?.id || null);
        setReviews([]);
      }
      setNotice(successMessage);
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      setAdminBusy('');
    }
  }

  const isDetail = ['venue', 'rate', 'facility', 'newVenue', 'admin', 'thanks'].includes(view);

  return (
    <main className="app-shell">
      <section className={cx('phone-frame', isDetail && 'phone-frame--detail')} aria-label="Tribunesliter mobilapp">
        <Header user={user} profile={profile} mode={mode} onHome={() => go('home')} onProfile={() => go('profile')} />

        {notice && view !== 'profile' && (
          <button className="notice" type="button" onClick={() => setNotice('')}>
            {notice}
          </button>
        )}

        {loading ? (
          <LoadingView />
        ) : (
          <>
            {view === 'home' && (
              <HomeView
                venues={venues}
                recentVenues={recentVenues}
                user={user}
                profile={profile}
                onSearch={() => go('search')}
                onVenue={(id) => go('venue', id)}
                onNewVenue={() => go('newVenue')}
              />
            )}
            {view === 'search' && (
              <SearchView
                venues={filteredVenues}
                allVenueCount={venues.length}
                query={query}
                filter={filter}
                municipalityFilter={municipalityFilter}
                sportFilter={sportFilter}
                sortMode={sortMode}
                municipalities={municipalities}
                sports={sports}
                user={user}
                onQuery={setQuery}
                onFilter={setFilter}
                onMunicipalityFilter={setMunicipalityFilter}
                onSportFilter={setSportFilter}
                onSortMode={setSortMode}
                onVenue={(id) => go('venue', id)}
                onNewVenue={() => go('newVenue')}
              />
            )}
            {view === 'explore' && (
              <ExploreView
                venues={venues}
                municipalities={municipalities}
                onVenue={(id) => go('venue', id)}
                onNewVenue={() => go('newVenue')}
              />
            )}
            {view === 'saved' && (
              <SavedView
                venues={savedVenues}
                savedCount={savedVenueIds.length}
                onVenue={(id) => go('venue', id)}
                onExplore={() => go('search')}
              />
            )}
            {view === 'venue' && selectedVenue && (
              <VenueView
                venue={selectedVenue}
                reviews={reviews}
                onBack={() => go('home')}
                onRate={() => {
                  setReviewForm((form) => makeReviewFormForVenue(selectedVenue, form));
                  go('rate', selectedVenue.id);
                }}
                onReportFacility={() => {
                  setFacilityForm(makeFacilityReportFromVenue(selectedVenue));
                  go('facility', selectedVenue.id);
                }}
                isSaved={savedVenueIds.includes(selectedVenue.id)}
                onToggleSaved={() => toggleSavedVenue(selectedVenue.id)}
                onShare={() => shareVenue(selectedVenue)}
              />
            )}
            {view === 'rate' && (
              <RateView
                venues={venues}
                selectedVenue={selectedVenue}
                form={reviewForm}
                setForm={setReviewForm}
                onSubmit={handleSubmitReview}
                onBack={() => go(selectedVenue ? 'venue' : 'home', selectedVenue?.id)}
              />
            )}
            {view === 'facility' && (
              <FacilityReportView
                selectedVenue={selectedVenue}
                form={facilityForm}
                setForm={setFacilityForm}
                onSubmit={handleSubmitFacilityReport}
                onBack={() => go(selectedVenue ? 'venue' : 'home', selectedVenue?.id)}
              />
            )}
            {view === 'thanks' && <ThanksView venue={selectedVenue} onHome={() => go('home')} onVenue={() => go('venue', selectedVenue?.id)} />}
            {view === 'profile' && (
              <ProfileView
                user={user}
                profile={profile}
                mode={mode}
                canModerate={canModerate(profile, mode)}
                badgeProgress={badgeProgress}
                notice={notice}
                authBusy={authBusy}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onAdmin={loadModeration}
                onInstall={installApp}
                canInstall={Boolean(installPrompt)}
                installHintDismissed={installHintDismissed}
                onDismissNotice={() => setNotice('')}
                onDismissInstall={dismissInstallHint}
              />
            )}
            {view === 'newVenue' && (
              <NewVenueView
                form={venueRequest}
                setForm={setVenueRequest}
                onSubmit={handleSubmitVenueRequest}
                onBack={() => go('home')}
              />
            )}
            {view === 'admin' && (
              <AdminView
                venues={venues}
                moderation={moderation}
                busy={adminBusy}
                onBack={() => go('profile')}
                onRefresh={refreshModeration}
                onHideReview={(id) => runAdminAction(`hide-review-${id}`, () => hideReview(id), 'Vurderingen er skjult.')}
                onRejectFacility={(id) => runAdminAction(`reject-facility-${id}`, () => rejectFacilityReport(id), 'Fasilitetsinfo er skjult.')}
                onApproveVenue={(request) => runAdminAction(`approve-venue-${request.id}`, () => approveVenueRequest(request), 'Anlegget er godkjent og publisert.')}
                onRejectVenue={(id) => runAdminAction(`reject-venue-${id}`, () => rejectVenueRequest(id), 'Anleggsforslaget er avvist.')}
                onArchiveVenue={(venue) => {
                  const confirmed = window.confirm(`Arkiver ${venue.name}? Anlegget fjernes fra offentlig liste, men historikk beholdes.`);
                  if (!confirmed) return;
                  runAdminAction(`archive-venue-${venue.id}`, () => archiveVenue(venue.id), 'Anlegget er fjernet fra offentlig liste.');
                }}
              />
            )}
          </>
        )}

        <BottomNav active={view} onNav={go} selectedVenue={selectedVenue} savedCount={savedVenueIds.length} />
      </section>
    </main>
  );
}

function Header({ onHome }) {
  return (
    <header className="topbar">
      <div className="brand-stack">
        <button className="brand-button" type="button" onClick={onHome} aria-label="Til forsiden">
          <img className="brand-banner" src="/assets/tribunesliter-banner.png" alt="Tribunesliter" />
        </button>
        <button className="region-pill" type="button" onClick={onHome} aria-label="Velg region">
          <span>Din region</span>
          <strong>Viken</strong>
        </button>
      </div>
    </header>
  );
}

function LoadingView() {
  return (
    <section className="screen center-screen">
      <img className="loader loader--app-icon" src={GLAD_RUMPE_ICON_SRC} alt="" aria-hidden="true" />
      <h1>Laster Tribunesliter</h1>
      <p>Henter haller, tribuner og vurderinger.</p>
      <div className="skeleton-list" aria-hidden="true"><span /><span /><span /></div>
    </section>
  );
}

function HomeView({ venues, recentVenues, user, profile, onSearch, onVenue, onNewVenue }) {
  const displayName = userDisplayName(user, profile);
  const firstName = displayName.split(/\s+/)[0] || 'tribunesliter';
  const topVenues = [...venues].sort((a, b) => scoreFromMinutes(b.tribunesliter_minutes) - scoreFromMinutes(a.tribunesliter_minutes)).slice(0, 5);
  const reportedVenues = [...venues]
    .filter((venue) => Number(venue.review_count || 0) > 0)
    .sort((a, b) => Number(b.review_count || 0) - Number(a.review_count || 0))
    .slice(0, 3);
  const recentCards = recentVenues.length ? recentVenues : topVenues.slice(0, 4);
  const totalReports = venues.reduce((sum, venue) => sum + Number(venue.review_count || 0), 0);

  return (
    <section className="screen home-dashboard-screen">
      <div className="home-greeting">
        <span className="subtle-label">Tribunesliter beta</span>
        <h1>Hei, {firstName}</h1>
        <p>Finn hallen før kamp, sjekk putefaren og bidra med rumpedata etterpå.</p>
        <button className="searchbox searchbox--button" type="button" onClick={onSearch}>
          <Icon name="search" />
          <span>Søk hall, bane eller kommune</span>
        </button>
      </div>

      <div className="home-stat-strip">
        <InfoCell label="Anlegg" value={venues.length} />
        <InfoCell label="Vurderinger" value={totalReports} />
        <InfoCell label="Topp score" value={topVenues[0] ? scoreFromMinutes(topVenues[0].tribunesliter_minutes) : 0} />
      </div>

      <section className="home-section">
        <SectionHeader title={recentVenues.length ? 'Sist besøkt' : 'Kom i gang'} action="Søk" onAction={onSearch} />
        {recentCards.length ? (
          <div className="recent-rail">
            {recentCards.map((venue) => <RecentVenueCard key={venue.id} venue={venue} onClick={() => onVenue(venue.id)} />)}
          </div>
        ) : (
          <EmptyState title="Ingen haller ennå" text="Når Supabase har anlegg, dukker de opp her." action="Foreslå anlegg" onAction={onNewVenue} />
        )}
      </section>

      <section className="home-section">
        <SectionHeader title="Ferske vurderinger" action="Søk" onAction={onSearch} />
        {reportedVenues.length ? (
          <div className="report-feed">
            {reportedVenues.map((venue) => <ReportTeaser key={venue.id} venue={venue} onClick={() => onVenue(venue.id)} />)}
          </div>
        ) : (
          <EmptyState title="Ingen vurderinger enda" text="Bli første som tester en tribune og setter standarden." action="Finn hall" onAction={onSearch} />
        )}
      </section>

      <section className="home-section">
        <SectionHeader title="Snillest mot rumpa" action="Alle" onAction={onSearch} />
        <div className="toplist app-card">
          {topVenues.length ? topVenues.map((venue, index) => (
            <TopVenueRow key={venue.id} venue={venue} rank={index + 1} onClick={() => onVenue(venue.id)} />
          )) : (
            <p className="muted">Topplisten våkner når hallene er hentet.</p>
          )}
        </div>
      </section>

      <button className="floating-new-venue" type="button" onClick={onNewVenue}>
        + Foreslå nytt anlegg
      </button>
    </section>
  );
}

function RecentVenueCard({ venue, onClick }) {
  const score = scoreFromMinutes(venue.tribunesliter_minutes);
  return (
    <button className="recent-card" type="button" onClick={onClick}>
      <div className={cx('score-badge', `score-badge--${venueTone(venue)}`)}>
        <b>{score || '–'}</b>
        <span>Score</span>
      </div>
      <span className={cx('tag', venue.is_outdoor ? 'tag--blue' : 'tag--green')}>{venue.is_outdoor ? 'Ute' : 'Inne'}</span>
      <strong>{venue.name}</strong>
      <small>{venue.municipality} · {primarySport(venue)}</small>
    </button>
  );
}

function ReportTeaser({ venue, onClick }) {
  return (
    <button className="report-teaser app-card" type="button" onClick={onClick}>
      <div className="review-avatar">{venue.name[0]}</div>
      <div>
        <strong>{venue.name}</strong>
        <span>{venue.review_count} vurderinger · {deriveTribunesliterLabel(venue.tribunesliter_minutes)}</span>
      </div>
      <em>★ {scoreFromMinutes(venue.tribunesliter_minutes) || '–'}</em>
    </button>
  );
}

function TopVenueRow({ venue, rank, onClick }) {
  const score = scoreFromMinutes(venue.tribunesliter_minutes);
  return (
    <button className="toplist-row" type="button" onClick={onClick}>
      <span className="toplist-rank">{rank}</span>
      <div className={cx('score-badge', `score-badge--${venueTone(venue)}`)}>
        <b>{score || '–'}</b>
        <span>Score</span>
      </div>
      <div>
        <strong>{venue.name}</strong>
        <small>{deriveTribunesliterLabel(venue.tribunesliter_minutes)}</small>
      </div>
      <i aria-hidden="true">›</i>
    </button>
  );
}

function SearchView({
  venues,
  allVenueCount,
  query,
  filter,
  municipalityFilter,
  sportFilter,
  sortMode,
  municipalities,
  sports,
  user,
  onQuery,
  onFilter,
  onMunicipalityFilter,
  onSportFilter,
  onSortMode,
  onVenue,
  onNewVenue,
}) {
  return (
    <section className="screen home-screen">
      <label className="searchbox searchbox--home">
        <Icon name="search" />
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Søk hall, bane eller kommune…" />
      </label>

      <div className="filter-row" aria-label="Hurtigfilter">
        {[
          ['all', 'Alle'],
          ['indoor', 'Innendørs'],
          ['outdoor', 'Utendørs'],
          ['cushion', 'Putealarm 🪑'],
          ['kiosk', 'Kiosk'],
          ['rated', 'Har data'],
          ['needsData', 'Mangler data'],
        ].map(([key, label]) => (
          <button key={key} className={cx('chip', filter === key && 'chip--active')} type="button" onClick={() => onFilter(key)}>
            {label}
          </button>
        ))}
      </div>

      <div className="filter-panel app-card app-card--soft">
        <label>
          Kommune
          <select value={municipalityFilter} onChange={(event) => onMunicipalityFilter(event.target.value)}>
            <option value="all">Alle kommuner</option>
            {municipalities.map((municipality) => <option value={municipality} key={municipality}>{municipality}</option>)}
          </select>
        </label>
        <label>
          Idrett
          <select value={sportFilter} onChange={(event) => onSportFilter(event.target.value)}>
            <option value="all">Alle idretter</option>
            {sports.map((sport) => <option value={sport} key={sport}>{sport}</option>)}
          </select>
        </label>
      </div>

      <div className="list-meta">
        <span>{venues.length} av {allVenueCount} anlegg</span>
        <label>
          <span>Sorter</span>
          <select value={sortMode} onChange={(event) => onSortMode(event.target.value)}>
            <option value="score">Snillest mot rumpa</option>
            <option value="reviews">Flest vurderinger</option>
            <option value="municipality">Kommune</option>
            <option value="name">Navn</option>
          </select>
        </label>
      </div>

      <div className="venue-list">
        {venues.length === 0 ? (
          <EmptyState
            title="Ingen anlegg traff søket"
            text="Prøv et annet filter, eller foreslå hallen hvis den mangler. Rumpa trenger data."
            action="Foreslå anlegg"
            onAction={onNewVenue}
          />
        ) : venues.map((venue) => <VenueCard venue={venue} key={venue.id} onClick={() => onVenue(venue.id)} />)}
      </div>

      <button className="floating-new-venue" type="button" onClick={onNewVenue}>
        + Foreslå nytt anlegg
      </button>
      {!user && <p className="micro-copy">Alle kan lese. Logg inn når du vil bidra med rumpedata.</p>}
    </section>
  );
}


function ExploreView({ venues, municipalities, onVenue, onNewVenue }) {
  const grouped = municipalities.map((municipality) => ({
    municipality,
    venues: venues.filter((venue) => venue.municipality === municipality),
  })).filter((group) => group.venues.length);
  const outdoorCount = venues.filter((venue) => venue.is_outdoor).length;
  const ratedCount = venues.filter((venue) => Number(venue.review_count || 0) > 0).length;

  return (
    <section className="screen explore-screen">
      <div className="home-title-block">
        <span className="subtle-label">Utforsk</span>
        <h1>Kart, kommuner og anlegg.</h1>
        <p>Rask oversikt for beta-testing. Kartlenker åpnes i Google Maps når adresse finnes.</p>
      </div>

      <div className="stat-grid app-card">
        <InfoCell label="Anlegg" value={venues.length} />
        <InfoCell label="Kommuner" value={municipalities.length} />
        <InfoCell label="Utendørs" value={outdoorCount} />
        <InfoCell label="Med vurderinger" value={ratedCount} />
      </div>

      {grouped.length === 0 ? (
        <EmptyState title="Ingen anlegg ennå" text="Legg inn vurdering første hall, så får utforsk-visningen innhold." action="Foreslå anlegg" onAction={onNewVenue} />
      ) : (
        <div className="municipality-list">
          {grouped.map((group) => (
            <section className="municipality-card app-card" key={group.municipality}>
              <div className="municipality-card__head">
                <div>
                  <span className="eyebrow">Kommune</span>
                  <h2>{group.municipality}</h2>
                </div>
                <strong>{group.venues.length}</strong>
              </div>
              <div className="map-venue-list">
                {group.venues.map((venue) => {
                  const mapQuery = [venue.name, venue.address, venue.municipality].filter(Boolean).join(', ');
                  return (
                    <article className="map-venue-row" key={venue.id}>
                      <button type="button" onClick={() => onVenue(venue.id)}>
                        <strong>{venue.name}</strong>
                        <span>{venue.venue_type} · {primarySport(venue)}</span>
                      </button>
                      {mapQuery && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer" aria-label={`Åpne kart for ${venue.name}`}>
                          <Icon name="map" />
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}

function SavedView({ venues, savedCount, onVenue, onExplore }) {
  return (
    <section className="screen saved-screen">
      <div className="home-title-block">
        <span className="subtle-label">Lagret</span>
        <h1>Dine faste tribuner.</h1>
        <p>Lagret lokalt på denne enheten, så du raskt finner igjen haller før kamp og cup.</p>
      </div>

      {venues.length === 0 ? (
        <EmptyState
          title="Ingen lagrede haller"
          text={savedCount ? 'Noen lagrede anlegg finnes ikke lenger i datasettet.' : 'Åpne en hall og trykk hjertet for å lagre den her.'}
          action="Utforsk anlegg"
          onAction={onExplore}
        />
      ) : (
        <div className="venue-list">
          {venues.map((venue) => <VenueCard venue={venue} key={venue.id} isSaved onClick={() => onVenue(venue.id)} />)}
        </div>
      )}
    </section>
  );
}

function VenueCard({ venue, onClick, isSaved = false }) {
  const score = scoreFromMinutes(venue.tribunesliter_minutes);
  const tone = venueTone(venue);
  return (
    <button className="venue-card" type="button" onClick={onClick}>
      <div className={cx('score-badge', `score-badge--${tone}`)}>
        <b>{score || '–'}</b>
        <span>Score</span>
      </div>
      <div className="venue-card__body">
        <strong>{venue.name}</strong>
        <span>{venue.municipality} · {venue.address || venue.venue_type}</span>
        <div className="tag-row">
          <small className={cx('tag', venue.is_outdoor ? 'tag--blue' : 'tag--green')}>{venue.is_outdoor ? 'Utendørs' : 'Innendørs'}</small>
          <small className="tag tag--neutral">{primarySport(venue)}</small>
          <small className="tag tag--amber">★ {venue.review_count || 0}</small>
          {isSaved && <small className="tag tag--green">Lagret</small>}
        </div>
        <div className="venue-card__foot">
          {statusLines(venue).map((line) => <em key={line}>{line}</em>)}
        </div>
      </div>
    </button>
  );
}

function VenueView({ venue, reviews, onBack, onRate, onReportFacility, isSaved, onToggleSaved, onShare }) {
  const facilities = venue.facilities || {};
  const mapQuery = [venue.name, venue.address, venue.municipality].filter(Boolean).join(', ');
  const score = scoreFromMinutes(venue.tribunesliter_minutes);
  const progressStyle = { '--score': `${score}%` };
  const facilityRows = FACILITY_DISPLAY_ROWS[venueRatingKind(venue.is_outdoor)].map((row) => [row.label, row.value(facilities), row.emoji]);

  return (
    <section className="screen detail-screen">
      <div className="detail-topbar">
        <button className="icon-button" type="button" onClick={onBack} aria-label="Tilbake"><Icon name="back" /></button>
        <div className="detail-actions">
          <button className="icon-button" type="button" aria-label="Del" onClick={onShare}><Icon name="share" /></button>
          <button className={cx('icon-button', isSaved && 'icon-button--active')} type="button" aria-label={isSaved ? 'Fjern fra lagret' : 'Lagre'} onClick={onToggleSaved}><Icon name="heart" /></button>
        </div>
      </div>

      <article className="venue-hero-card app-card">
        <div className="tag-row tag-row--top">
          <span className={cx('tag', venue.is_outdoor ? 'tag--blue' : 'tag--green')}>{venue.is_outdoor ? 'Utendørs' : 'Innendørs'}</span>
          <span className="tag tag--neutral">{venue.venue_type}</span>
          {venue.sport_tags?.slice(0, 2).map((tag) => <span className="tag tag--neutral" key={tag}>{tag}</span>)}
        </div>
        <h1>{venue.name}</h1>
        <p>{venue.municipality} · {venue.address || 'Adresse ikke registrert'}</p>

        <div className="score-hero">
          <div className="score-ring" style={progressStyle}>
            <strong>{score || '–'}</strong>
            <span>/100</span>
          </div>
          <div>
            <span className="caps-label">Tribunesliter-score</span>
            <h2><RumpeText>Rumpa holder ~{venue.tribunesliter_minutes || '–'} min</RumpeText></h2>
            <p>{venue.summary || deriveTribunesliterLabel(venue.tribunesliter_minutes || 0)}</p>
            <small>★ {reviews.length || venue.review_count || 0} vurderinger</small>
          </div>
        </div>
      </article>

      {cushionAlarm(venue) && (
        <div className="alert-card alert-card--amber">
          <strong>🪑 Putealarm</strong>
          <span>{deriveTribunesliterLabel(venue.tribunesliter_minutes || 0)}</span>
        </div>
      )}

      <div className="subscore-row">
        <SubScore label={ratingLabel('seating', facilities.seat_comfort)} value={facilities.seat_comfort} emoji={RUMPE_ICON} />
        <SubScore label={venue.is_outdoor ? ratingLabel('weather', facilities.heating_level) : ratingLabel('temperature', facilities.heating_level)} value={facilities.heating_level} emoji={venue.is_outdoor ? '🌧️' : '🌡️'} />
        <SubScore label={parkingLabel(facilities.parking)} value={PARKING_OPTIONS.indexOf(parkingLabel(facilities.parking)) + 1 || 3} emoji="🚗" />
      </div>

      <section className="panel app-card compact-info-grid">
        <InfoCell label="Type" value={venue.venue_type} />
        <InfoCell label="Underlag" value={venue.is_outdoor ? 'Ute' : 'Inne'} />
        <InfoCell label="Idrett" value={venue.sport_tags?.join(', ') || 'Ukjent'} />
        <InfoCell label="Sist bekreftet" value={venue.facility_reported_at ? shortDate(venue.facility_reported_at) : 'Mangler'} />
        {mapQuery && (
          <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noreferrer">
            <Icon name="map" /> Åpne kart
          </a>
        )}
      </section>

      <section className="panel app-card">
        <SectionHeader title="Anleggsinfo" />
        <div className="facility-grid">
          {facilityRows.map(([label, value, emoji]) => (
            <div className="facility-row" key={label}>
              <span className="facility-row__icon"><IconGlyph icon={emoji || facilityEmoji(label)} /></span>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        {facilities.notes && <p className="facility-note">{facilities.notes}</p>}
      </section>

      <section className="panel app-card panel--amber-soft">
        <h2>Pakkeliste</h2>
        <div className="pack-row">
          {(venue.packlist || []).length ? (venue.packlist || []).map((item) => <span key={item}>{item}</span>) : <span>🪑 Ta med pute</span>}
        </div>
      </section>

      <section className="panel app-card">
        <SectionHeader title="Siste vurderinger" action="Legg inn vurdering" onAction={onRate} />
        <div className="review-list">
          {reviews.length === 0 ? (
            <EmptyState title="Ingen vurderinger enda" text="Bli første sliter som vurderer sitteplassen." action={<RumpeText>Vurder sitteplassen</RumpeText>} onAction={onRate} />
          ) : (
            reviews.map((review) => <ReviewCard review={review} venueIsOutdoor={venue.is_outdoor} key={review.id} />)
          )}
        </div>
      </section>

      <div className="sticky-actions sticky-actions--single">
        <button className="primary-action" type="button" onClick={onRate}><RumpeText>Vurder sitteplassen</RumpeText></button>
      </div>
    </section>
  );
}

function SubScore({ label, value, emoji }) {
  const number = Math.max(1, Math.min(5, Number(value || 1)));
  return (
    <div className="subscore-card">
      <span className="subscore-card__icon"><IconGlyph icon={emoji} /></span>
      <strong>{number}/5</strong>
      <small>{label}</small>
      <i style={{ '--bar': `${number * 20}%` }} />
    </div>
  );
}

function InfoCell({ label, value }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="section-title section-title--inside">
      <h2>{title}</h2>
      {action && <button type="button" onClick={onAction}>{action}</button>}
    </div>
  );
}

function ReviewCard({ review, venueIsOutdoor = false }) {
  const categoriesForReview = REVIEW_CATEGORIES[venueRatingKind(venueIsOutdoor)];
  return (
    <article className="review-card">
      <div className="review-card__top">
        <div className="review-avatar">{(review.user_name || review.display_name || 'B')[0]}</div>
        <div>
          <strong>{review.user_name || review.display_name || 'Innlogget bruker'}</strong>
          <small>{review.event_type} · {shortDate(review.visit_date)}</small>
        </div>
        <span>{review.tribunesliter_minutes} min</span>
      </div>
      <p>{review.comment || 'Ingen kommentar. Men rumpa har talt.'}</p>
      <div className="review-humor-tags">
        {categoriesForReview.map((category) => (
          <span key={category.key}><IconGlyph icon={category.icon} /> {ratingLabel(category.scale, review[category.key])}</span>
        ))}
      </div>
    </article>
  );
}

function RateView({ venues, selectedVenue, form, setForm, onSubmit, onBack }) {
  const [venueSearch, setVenueSearch] = useState('');
  const selectedVenueId = form.venue_id || selectedVenue?.id || '';
  const selectedVenueFromForm = venues.find((venue) => venue.id === selectedVenueId);
  const selectedMunicipality = form.venue_municipality || selectedVenueFromForm?.municipality || '';
  const municipalities = useMemo(
    () => [...new Set(venues.map((venue) => venue.municipality).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'nb')),
    [venues]
  );
  const filteredVenues = useMemo(() => {
    const normalizedSearch = venueSearch.trim().toLowerCase();
    return venues
      .filter((venue) => !selectedMunicipality || venue.municipality === selectedMunicipality)
      .filter((venue) => {
        if (!normalizedSearch) return true;
        return [venue.name, venue.address, venue.venue_type, venue.municipality, ...(venue.sport_tags || [])].join(' ').toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => `${a.municipality} ${a.name}`.localeCompare(`${b.municipality} ${b.name}`, 'nb'));
  }, [selectedMunicipality, venueSearch, venues]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function updateFacility(key, value) {
    setForm((current) => ({ ...current, include_facilities: true, [key]: value }));
  }
  function updateUnified(field, value) {
    setForm((current) => ({
      ...current,
      include_facilities: true,
      [field.key]: value,
      ...(field.facilityKey ? { [field.facilityKey]: value } : {}),
    }));
  }
  function updateMunicipality(value) {
    setForm((current) => {
      const currentVenue = venues.find((venue) => venue.id === current.venue_id);
      return {
        ...current,
        venue_municipality: value,
        venue_id: currentVenue && currentVenue.municipality === value ? current.venue_id : '',
      };
    });
  }
  function updateVenue(value) {
    const venue = venues.find((item) => item.id === value);
    setForm((current) => venue ? makeReviewFormForVenue(venue, current) : { ...current, venue_id: '', venue_municipality: current.venue_municipality });
  }
  function addTag(tag) {
    setForm((current) => {
      const existing = current.comment || '';
      return { ...current, comment: existing.includes(tag) ? existing : `${existing}${existing ? ' ' : ''}${tag}` };
    });
  }

  const venueIsOutdoor = Boolean(selectedVenueFromForm?.is_outdoor ?? selectedVenue?.is_outdoor);
  const ratingKind = venueRatingKind(venueIsOutdoor);
  const unifiedRatingFields = UNIFIED_RATING_FIELDS[ratingKind];

  return (
    <section className="screen detail-screen form-screen">
      <FormHeader onBack={onBack} />
      <form className="form-stack" onSubmit={onSubmit}>
        <section className="form-card app-card">
          <SectionHeader title="Besøk" />
          <div className="two-cols">
            <label>
              Kommune
              <select value={selectedMunicipality} onChange={(event) => updateMunicipality(event.target.value)} required>
                <option value="">Velg kommune</option>
                {municipalities.map((municipality) => <option value={municipality} key={municipality}>{municipality}</option>)}
              </select>
            </label>
            <label>
              Søk
              <input value={venueSearch} onChange={(event) => setVenueSearch(event.target.value)} placeholder="Søk anlegg" />
            </label>
          </div>
          <label>
            Anlegg
            <select value={selectedVenueId} onChange={(event) => updateVenue(event.target.value)} required>
              <option value="">Velg anlegg</option>
              {filteredVenues.map((venue) => <option value={venue.id} key={venue.id}>{venue.name}</option>)}
            </select>
          </label>
          {selectedMunicipality && filteredVenues.length === 0 && <p className="micro-copy">Ingen anlegg matcher søket i denne kommunen.</p>}
          <div className="two-cols">
            <label>
              Type besøk
              <select value={form.event_type} onChange={(event) => update('event_type', event.target.value)}>
                <option>Kamp</option>
                <option>Cup</option>
                <option>Trening</option>
                <option>Turnering</option>
                <option>Annet</option>
              </select>
            </label>
            <label>
              Dato
              <input type="date" value={form.visit_date} max={new Date().toISOString().slice(0, 10)} onChange={(event) => update('visit_date', event.target.value)} />
            </label>
          </div>
        </section>

        <section className="form-card app-card form-card--dark">
          <span className="caps-label">Rumpe-o-meter</span>
          <div className="rumpe-meter">
            <strong>{form.tribunesliter_minutes}</strong>
            <span>minutter</span>
          </div>
          <p>{deriveTribunesliterLabel(form.tribunesliter_minutes)}</p>
          <label className="range-label range-label--hero">
            <span>0 ståplass</span><span>90 sofa</span>
            <input
              type="range"
              min="5"
              max="90"
              value={form.tribunesliter_minutes}
              onChange={(event) => update('tribunesliter_minutes', event.target.value)}
            />
          </label>
        </section>

        <section className="form-card app-card">
          <label>
            Sitteplass
            <select value={form.facility_seating_type} onChange={(event) => updateFacility('facility_seating_type', event.target.value)}>
              <option>Trebenk</option>
              <option>Plastseter</option>
              <option>Betongtribune</option>
              <option>Ståtribune</option>
              <option>Ingen tribune</option>
              <option>Ta med egen stol</option>
              <option>Annet</option>
            </select>
          </label>
          <div className="toggle-row">
            <Toggle checked={form.facility_has_backrest} onChange={(checked) => updateFacility('facility_has_backrest', checked)} label="Ryggstøtte" />
            <Toggle checked={form.facility_roof_cover} onChange={(checked) => updateFacility('facility_roof_cover', checked)} label={venueIsOutdoor ? 'Tak / ly' : 'Tak/overbygg'} />
          </div>
          <div className="dice-grid">
            {unifiedRatingFields.map((field) => (
              <HumorRating
                key={field.key}
                icon={field.icon}
                label={field.label}
                scale={field.scale}
                value={Number(form[field.key])}
                onChange={(value) => updateUnified(field, value)}
              />
            ))}
          </div>
          <ChoicePills label="Kiosk / kaffe" icon="☕" value={kioskLabel(form.facility_kiosk_status)} options={KIOSK_OPTIONS} onChange={(value) => updateFacility('facility_kiosk_status', value)} />
          <ChoicePills label="Parkering" icon="🚗" value={parkingLabel(form.facility_parking)} options={PARKING_OPTIONS} onChange={(value) => updateFacility('facility_parking', value)} />
          <label>
            Navn eller kallenavn
            <input value={form.user_name} onChange={(event) => update('user_name', event.target.value)} placeholder="F.eks. tribunekonge" maxLength="40" required />
          </label>
          <label>
            Kommentar
            <textarea rows="5" value={form.comment} onChange={(event) => update('comment', event.target.value)} placeholder="Hva bør andre vite før de setter seg her?" maxLength={MAX_COMMENT_LENGTH} />
          </label>
          <div className="quick-tags">
            {quickTags.map((tag) => <button type="button" key={tag} onClick={() => addTag(tag)}>{tag}</button>)}
          </div>
        </section>

        <div className="sticky-actions sticky-actions--single">
          <button className="primary-action" type="submit"><RumpeText>Send inn vurdering</RumpeText></button>
        </div>
      </form>
    </section>
  );
}

function HumorRating({ icon, label, scale, value, onChange }) {
  const numericValue = Math.max(1, Math.min(5, Number(value || 3)));
  return (
    <div className="humor-rating">
      <span><span className="rating-label"><IconGlyph icon={icon} /> {label}</span><b>{ratingLabel(scale, numericValue)}</b></span>
      <div className="humor-rating__options" role="group" aria-label={label}>
        {ratingOptions(scale).map((option) => (
          <button
            key={option.value}
            type="button"
            className={cx(option.value === numericValue && 'selected')}
            onClick={() => onChange(option.value)}
            title={`${option.value}: ${option.label}`}
          >
            <em>{option.emoji}</em>
            <strong>{option.label}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoicePills({ icon, label, value, options, onChange }) {
  return (
    <div className="choice-pills">
      <span>{icon} {label}<b>{value}</b></span>
      <div role="group" aria-label={label}>
        {options.map((option) => (
          <button key={option} type="button" className={cx(option === value && 'selected')} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className={cx('toggle-card', checked && 'toggle-card--on')}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{checked ? '✓' : '+'}</span>
      {label}
    </label>
  );
}

function FacilitySlider({ label, value, onChange, scale = 'seating', icon = '•' }) {
  return <HumorRating icon={icon} label={label} scale={scale} value={value} onChange={onChange} />;
}

function FormHeader({ title, step, onBack }) {
  const hasText = Boolean(title || step);
  return (
    <div className="form-header">
      <button className="icon-button" type="button" onClick={onBack} aria-label="Tilbake"><Icon name="close" /></button>
      {hasText ? (
        <div>
          <strong>{title}</strong>
          <span>{step}</span>
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
      <i aria-hidden="true" />
    </div>
  );
}

function FacilityReportView({ selectedVenue, form, setForm, onSubmit, onBack }) {
  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  const currentFacilities = selectedVenue?.facilities || {};
  const venueIsOutdoor = Boolean(selectedVenue?.is_outdoor);
  const facilityRatingFields = FACILITY_RATING_FIELDS[venueRatingKind(venueIsOutdoor)];

  return (
    <section className="screen detail-screen form-screen">
      <FormHeader title="Rett info" step="Publiseres direkte" onBack={onBack} />
      <div className="alert-card alert-card--blue">
        <strong>Info oppdateres med en gang</strong>
        <span>Moderator kan skjule eller rydde i etterkant hvis noe ikke stemmer.</span>
      </div>

      <form className="form-stack" onSubmit={onSubmit}>
        <section className="compare-grid">
          <div className="compare-card compare-card--old">
            <span>Offisiell info nå</span>
            <strong>{currentFacilities.seating_type || 'Ikke registrert'}</strong>
            <p>Kiosk: {kioskLabel(currentFacilities.kiosk_status)}</p>
            <p>Parkering: {parkingLabel(currentFacilities.parking)}</p>
          </div>
          <div className="compare-card compare-card--new">
            <span>Ditt forslag</span>
            <strong>{form.facility_seating_type || 'Ikke registrert'}</strong>
            <p>Kiosk: {kioskLabel(form.facility_kiosk_status)}</p>
            <p>Parkering: {parkingLabel(form.facility_parking)}</p>
          </div>
        </section>

        <section className="form-card app-card">
          <SectionHeader title={venueIsOutdoor ? 'Tribune og sidelinje' : 'Tribune og sitteplass'} />
          <label>
            Sitteplass
            <select value={form.facility_seating_type} onChange={(event) => update('facility_seating_type', event.target.value)}>
              <option>Trebenk</option>
              <option>Plastseter</option>
              <option>Betongtribune</option>
              <option>Ståtribune</option>
              <option>Ingen tribune</option>
              <option>Ta med egen stol</option>
              <option>Annet</option>
            </select>
          </label>
          <div className="toggle-row">
            <Toggle checked={form.facility_has_backrest} onChange={(checked) => update('facility_has_backrest', checked)} label="Ryggstøtte" />
            <Toggle checked={form.facility_roof_cover} onChange={(checked) => update('facility_roof_cover', checked)} label={venueIsOutdoor ? 'Tak / ly' : 'Tak/overbygg'} />
          </div>
          <div className="category-sliders compact">
            {facilityRatingFields.map((field) => (
              <HumorRating
                key={field.key}
                icon={field.icon}
                label={field.label}
                scale={field.scale}
                value={Number(form[field.key])}
                onChange={(value) => update(field.key, value)}
              />
            ))}
          </div>
        </section>

        <section className="form-card app-card">
          <SectionHeader title="Kiosk, do og parkering" />
          <ChoicePills label="Kiosk / kaffe" icon="☕" value={kioskLabel(form.facility_kiosk_status)} options={KIOSK_OPTIONS} onChange={(value) => update('facility_kiosk_status', value)} />
          <ChoicePills label="Parkering" icon="🚗" value={parkingLabel(form.facility_parking)} options={PARKING_OPTIONS} onChange={(value) => update('facility_parking', value)} />
          <label>
            Begrunnelse
            <textarea rows="5" value={form.facility_notes} onChange={(event) => update('facility_notes', event.target.value)} placeholder="Hva er feil eller mangler? Skriv konkret." maxLength={MAX_NOTES_LENGTH} />
          </label>
        </section>

        <div className="sticky-actions sticky-actions--single">
          <button className="primary-action" type="submit">Publiser info</button>
        </div>
      </form>
    </section>
  );
}

function ThanksView({ venue, onHome, onVenue }) {
  return (
    <section className="screen center-screen">
      <div className="success-card app-card">
        <img className="thanks-icon" src={GLAD_RUMPE_ICON_SRC} alt="" aria-hidden="true" />
        <span className="tag tag--green">🏅 +10 sliter-poeng</span>
        <h1>Numsen din er logget!</h1>
        <p>{venue ? `Vurderingen din er publisert for ${venue.name}.` : 'Vurderingen din er publisert.'}</p>
        <button className="primary-action" type="button" onClick={onVenue}>Se anlegget</button>
        <button className="secondary-action" type="button" onClick={onHome}>Til forsiden</button>
      </div>
    </section>
  );
}

function BadgePanel({ progress }) {
  return (
    <section className="badges-card app-card">
      <div className="section-title section-title--inside">
        <h2>Badges</h2>
        <span>{Number(progress?.checkIns || 0)} sjekk-ins</span>
      </div>
      <div className="badge-grid">
        {BADGE_DEFINITIONS.map((badge) => {
          const value = badgeValue(progress, badge);
          const unlocked = value >= badge.target;
          if (badge.hidden && !unlocked) return null;
          const percent = Math.min(100, Math.round((value / badge.target) * 100));
          return (
            <article className={cx('badge-card', unlocked && 'badge-card--unlocked', badge.hidden && 'badge-card--secret')} key={badge.id}>
              <div className="badge-card__icon"><IconGlyph icon={badge.icon} /></div>
              <div>
                <strong>{badge.title}</strong>
                <p>{badge.description}</p>
                <span>{Math.min(value, badge.target)} / {badge.target}</span>
                <i style={{ '--badge-progress': `${percent}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProfileView({ user, profile, mode, canModerate, badgeProgress, notice, authBusy, onLogin, onLogout, onAdmin, onInstall, canInstall, installHintDismissed, onDismissNotice, onDismissInstall }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const displayName = userDisplayName(user, profile, 'demo-bruker');

  return (
    <section className="screen">
      <div className="profile-card app-card">
        <p className="eyebrow">Min profil</p>
        <h1>{user ? 'Du er logget inn' : 'Frivillig profil'}</h1>
        <p>Du kan sende vurderinger uten konto. Badges teller på denne enheten, og innlogging kan senere brukes til å gjøre krav på bidragene dine.</p>
        <div className="mode-card">
          <strong>{mode === 'demo' ? 'Demo uten backend' : 'Supabase aktiv'}</strong>
          <span>{mode === 'demo' ? 'Vurderinger lagres bare på denne enheten.' : 'Vurderinger lagres i felles database.'}</span>
        </div>
        {user && (
          <div className="role-card">
            <span>Rolle</span>
            <strong>{mode === 'demo' ? 'admin-demo' : profile?.role || 'user'}</strong>
          </div>
        )}
      </div>

      <BadgePanel progress={badgeProgress} />

      {!installHintDismissed && (
        <div className="install-card app-card">
          <div>
            <span className="eyebrow">Mobilapp</span>
            <h2>Legg Tribunesliter på hjemskjermen</h2>
            <p>Android viser ofte egen installer-knapp. På iPhone bruker du Safari → Del → Legg til på Hjem-skjerm.</p>
          </div>
          <div className="install-actions">
            <button className="primary-action" type="button" onClick={onInstall}>{canInstall ? 'Installer app' : 'Vis installasjonstips'}</button>
            <button className="secondary-action" type="button" onClick={onDismissInstall}>Skjul</button>
          </div>
        </div>
      )}

      {user ? (
        <div className="form-card app-card">
          <p>Innlogget som <strong>{displayName}</strong></p>
          <button className="secondary-action" type="button" onClick={onLogout}>Logg ut</button>
          {canModerate ? (
            <button className="primary-action" type="button" onClick={onAdmin}>Åpne moderering</button>
          ) : (
            <p className="muted">Denne brukeren har ikke moderatorrolle ennå.</p>
          )}
        </div>
      ) : (
        <form className="form-card app-card" onSubmit={(event) => { event.preventDefault(); onLogin({ username, password, authMode }); }}>
          <div className="auth-toggle" role="tablist" aria-label="Innloggingstype">
            <button className={cx(authMode === 'login' && 'active')} type="button" onClick={() => setAuthMode('login')}>Logg inn</button>
            <button className={cx(authMode === 'signup' && 'active')} type="button" onClick={() => setAuthMode('signup')}>Opprett</button>
          </div>
          <label>
            Brukernavn
            <input value={username} onChange={(event) => setUsername(event.target.value)} type="text" inputMode="text" autoCapitalize="none" autoComplete="username" placeholder="f.eks. tribunekonge" required />
          </label>
          <label>
            Passord
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength="6" required />
          </label>
          <p className="micro-copy">Brukernavn: 3-24 tegn med bokstaver, tall, punktum, bindestrek eller understrek.</p>
          <button className="primary-action" type="submit" disabled={authBusy}>{authBusy ? (authMode === 'signup' ? 'Oppretter...' : 'Logger inn...') : (authMode === 'signup' ? 'Opprett bruker' : 'Logg inn')}</button>
          {notice && (
            <button className="auth-status" type="button" onClick={onDismissNotice} role="status" aria-live="polite">
              {notice}
            </button>
          )}
        </form>
      )}
    </section>
  );
}

function NewVenueView({ form, setForm, onSubmit, onBack }) {
  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="screen detail-screen form-screen">
      <FormHeader title="Foreslå anlegg" step="Nytt sted" onBack={onBack} />
      <form className="form-card app-card" onSubmit={onSubmit}>
        <p className="eyebrow">Mangler anlegget?</p>
        <h1>Legg den i køen</h1>
        <p>Forslaget kan godkjennes av moderator før det vises offentlig.</p>
        <label>
          Navn
          <input value={form.name} onChange={(event) => update('name', event.target.value)} required />
        </label>
        <label>
          Kommune
          <input value={form.municipality} onChange={(event) => update('municipality', event.target.value)} required />
        </label>
        <label>
          Adresse
          <input value={form.address} onChange={(event) => update('address', event.target.value)} />
        </label>
        <div className="two-cols">
          <label>
            Type
            <select value={form.venue_type} onChange={(event) => update('venue_type', event.target.value)}>
              <option>Flerbrukshall</option>
              <option>Idrettshall</option>
              <option>Utendørsbane</option>
              <option>Stadion</option>
              <option>Skolegymsal</option>
            </select>
          </label>
          <Toggle checked={form.is_outdoor} onChange={(checked) => update('is_outdoor', checked)} label="Utendørs" />
        </div>
        <label>
          Notat
          <textarea rows="4" value={form.notes} onChange={(event) => update('notes', event.target.value)} placeholder="Tribune, kiosk, parkering, vær, annet…" maxLength={MAX_NOTES_LENGTH} />
        </label>
        <button className="primary-action" type="submit">Send forslag</button>
      </form>
    </section>
  );
}

function AdminView({
  venues = [],
  moderation,
  busy,
  onBack,
  onRefresh,
  onHideReview,
  onRejectFacility,
  onApproveVenue,
  onRejectVenue,
  onArchiveVenue,
}) {
  const [venueDrafts, setVenueDrafts] = useState({});
  const [venueSearch, setVenueSearch] = useState('');
  const pendingCount = moderation.venueRequests.length;
  const visibleVenues = useMemo(() => {
    const needle = venueSearch.trim().toLowerCase();
    if (!needle) return venues;
    return venues.filter((venue) => [
      venue.name,
      venue.municipality,
      venue.address,
      venue.venue_type,
      ...(venue.sport_tags || []),
    ].some((value) => String(value || '').toLowerCase().includes(needle)));
  }, [venues, venueSearch]);

  useEffect(() => {
    const nextDrafts = {};
    for (const request of moderation.venueRequests) {
      nextDrafts[request.id] = { ...request };
    }
    setVenueDrafts(nextDrafts);
  }, [moderation.venueRequests]);

  function updateDraft(id, key, value) {
    setVenueDrafts((current) => ({
      ...current,
      [id]: { ...current[id], [key]: value },
    }));
  }

  return (
    <section className="screen detail-screen admin-screen">
      <FormHeader title="Moderator" step="Ettersjekk" onBack={onBack} />
      <div className="admin-hero app-card">
        <span className="eyebrow">Moderator</span>
        <h1>Hold tribunekulturen ryddig.</h1>
        <p>Skjul upassende vurderinger, godkjenn anleggsforslag og rett praktisk info når du tar ukesrydden.</p>
        <button className="secondary-action" type="button" onClick={onRefresh}>Oppdater kø</button>
      </div>

      <div className="stat-row">
        <span className="stat-pill stat-pill--amber">Venter {pendingCount}</span>
        <span className="stat-pill stat-pill--green">Synlige vurderinger {moderation.approvedReviews.length}</span>
        <span className="stat-pill stat-pill--blue">Anlegg {venues.length}</span>
        <span className="stat-pill stat-pill--red">Skjul ved behov</span>
      </div>

      <section className="panel app-card">
        <SectionHeader title={`Synlige anlegg · ${venues.length}`} />
        <label className="admin-search">
          Finn anlegg
          <input value={venueSearch} onChange={(event) => setVenueSearch(event.target.value)} placeholder="Søk etter f.eks. Hotell City" />
        </label>
        {!visibleVenues.length ? (
          <p className="muted">Ingen synlige anlegg matcher søket.</p>
        ) : (
          <div className="review-list">
            {visibleVenues.map((venue) => (
              <ModerationVenueCard key={venue.id} venue={venue} busy={busy} onArchive={() => onArchiveVenue(venue)} />
            ))}
          </div>
        )}
      </section>

      <section className="panel app-card">
        <SectionHeader title={`Synlig anleggsinfo · ${moderation.facilityReports?.length || 0}`} />
        {!moderation.facilityReports?.length ? (
          <p className="muted">Ingen synlig fasilitetsinfo å sjekke.</p>
        ) : (
          <div className="review-list">
            {moderation.facilityReports.map((report) => (
              <ModerationFacilityCard key={report.id} report={report} busy={busy} onReject={() => onRejectFacility(report.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="panel app-card">
        <SectionHeader title={`Nye anleggsforslag · ${moderation.venueRequests.length}`} />
        {moderation.venueRequests.length === 0 ? (
          <p className="muted">Ingen ventende anlegg.</p>
        ) : (
          <div className="review-list">
            {moderation.venueRequests.map((request) => {
              const draft = venueDrafts[request.id] || request;
              return (
                <article className="mod-card mod-card--blue" key={request.id}>
                  <div className="mod-card__top"><span className="tag tag--blue">Nytt anlegg</span><small>{request.municipality}</small></div>
                  <h3>{request.name}</h3>
                  <p>{request.notes || request.address || 'Ingen notat.'}</p>
                  <div className="admin-edit-grid">
                    <label>Navn<input value={draft.name || ''} onChange={(event) => updateDraft(request.id, 'name', event.target.value)} /></label>
                    <label>Kommune<input value={draft.municipality || ''} onChange={(event) => updateDraft(request.id, 'municipality', event.target.value)} /></label>
                    <label>Adresse<input value={draft.address || ''} onChange={(event) => updateDraft(request.id, 'address', event.target.value)} /></label>
                    <label>Type<select value={draft.venue_type || 'Flerbrukshall'} onChange={(event) => updateDraft(request.id, 'venue_type', event.target.value)}><option>Flerbrukshall</option><option>Idrettshall</option><option>Utendørsbane</option><option>Stadion</option><option>Skolegymsal</option></select></label>
                    <Toggle checked={Boolean(draft.is_outdoor)} onChange={(checked) => updateDraft(request.id, 'is_outdoor', checked)} label="Utendørs" />
                  </div>
                  <div className="mini-actions"><button type="button" disabled={Boolean(busy)} onClick={() => onApproveVenue(draft)}>{busy === `approve-venue-${request.id}` ? 'Publiserer…' : 'Godkjenn'}</button><button type="button" disabled={Boolean(busy)} onClick={() => onRejectVenue(request.id)}>Avvis</button></div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel app-card">
        <SectionHeader title={`Synlige vurderinger · ${moderation.approvedReviews.length}`} />
        {moderation.approvedReviews.length === 0 ? (
          <p className="muted">Ingen synlige vurderinger å vise.</p>
        ) : (
          <div className="review-list">
            {moderation.approvedReviews.map((review) => <ModerationReviewCard key={review.id} review={review} busy={busy} visible onHide={() => onHideReview(review.id)} />)}
          </div>
        )}
      </section>
    </section>
  );
}

function ModerationVenueCard({ venue, busy, onArchive }) {
  return (
    <article className="mod-card mod-card--red">
      <div className="mod-card__top"><span className="tag tag--red">Synlig anlegg</span><small>{venue.municipality}</small></div>
      <h3>{venue.name}</h3>
      <p>{venue.address || venue.venue_type || 'Adresse ikke registrert.'}</p>
      <div className="score-row score-row--wrap">
        <span>{venue.venue_type}</span>
        <span>{venue.is_outdoor ? 'Utendørs' : 'Innendørs'}</span>
        <span>{venue.review_count || 0} vurderinger</span>
      </div>
      <div className="mini-actions">
        <button className="danger-action" type="button" disabled={Boolean(busy)} onClick={onArchive}>
          {busy === `archive-venue-${venue.id}` ? 'Arkiverer…' : 'Arkiver'}
        </button>
      </div>
    </article>
  );
}

function ModerationFacilityCard({ report, busy, onReject }) {
  const venueIsOutdoor = Boolean(report.venues?.is_outdoor);
  const rows = FACILITY_DISPLAY_ROWS[venueRatingKind(venueIsOutdoor)].map((row) => [
    row.label,
    row.value({
      seating_type: report.seating_type,
      has_backrest: report.has_backrest,
      roof_cover: report.roof_cover,
      seat_comfort: report.seat_comfort,
      heating_level: report.heating_level,
      toilet_quality: report.toilet_quality,
      garderobe_quality: report.garderobe_quality,
      shower_quality: report.shower_quality,
      kiosk_status: report.kiosk_status,
      parking: report.parking,
      accessibility: report.accessibility,
      view_quality: report.view_quality,
      noise_level: report.noise_level,
    }),
  ]);
  return (
    <article className="mod-card mod-card--green">
      <div className="mod-card__top"><span className="tag tag--green">Fasilitetsrapport</span><small>{shortDate(report.created_at)}</small></div>
      <h3>{report.venue_name || report.venues?.name || 'Ukjent anlegg'}</h3>
      <p>{report.notes || 'Ingen notat.'}</p>
      <div className="score-row score-row--wrap">{rows.map(([label, value]) => <span key={label}>{label}: {value ?? '–'}</span>)}</div>
      <div className="mini-actions"><button type="button" disabled={Boolean(busy)} onClick={onReject}>{busy === `reject-facility-${report.id}` ? 'Skjuler…' : 'Skjul info'}</button></div>
    </article>
  );
}

function ModerationReviewCard({ review, visible = false, busy, onApprove, onReject, onHide }) {
  const venueIsOutdoor = Boolean(review.venues?.is_outdoor);
  const reviewRows = REVIEW_CATEGORIES[venueRatingKind(venueIsOutdoor)].map((category) => `${category.label}: ${ratingLabel(category.scale, review[category.key])}`);
  return (
    <article className={cx('mod-card', visible ? 'mod-card--green' : 'mod-card--amber')}>
      <div className="mod-card__top"><span className="tag tag--amber">Vurdering</span><small>{review.tribunesliter_minutes} min</small></div>
      <h3>{review.venue_name || review.venues?.name || 'Ukjent anlegg'}</h3>
      <p>{review.comment || 'Ingen kommentar.'}</p>
      <div className="score-row score-row--wrap">{reviewRows.map((row) => <span key={row}>{row}</span>)}</div>
      <small>{review.event_type} · {shortDate(review.visit_date)}</small>
      <div className="mini-actions">
        {visible ? <button type="button" disabled={Boolean(busy)} onClick={onHide}>{busy === `hide-review-${review.id}` ? 'Skjuler…' : 'Skjul'}</button> : <><button type="button" disabled={Boolean(busy)} onClick={onApprove}>{busy === `approve-review-${review.id}` ? 'Godkjenner…' : 'Godkjenn'}</button><button type="button" disabled={Boolean(busy)} onClick={onReject}>Avvis</button></>}
      </div>
    </article>
  );
}

function EmptyState({ title, text, action, onAction }) {
  return (
    <div className="empty-state">
      <img className="empty-icon" src={GLAD_RUMPE_ICON_SRC} alt="" aria-hidden="true" />
      <strong>{title}</strong>
      <p>{text}</p>
      {action && <button type="button" onClick={onAction}>{action}</button>}
    </div>
  );
}

function BottomNav({ active, onNav, selectedVenue, savedCount }) {
  return (
    <nav className="bottom-nav" aria-label="Hovedmeny">
      <button className={cx(active === 'home' && 'active')} type="button" onClick={() => onNav('home')}><Icon name="home" /><span>Hjem</span></button>
      <button className={cx(active === 'search' && 'active')} type="button" onClick={() => onNav('search')}><Icon name="search" /><span>Søk</span></button>
      <button className="nav-fab" type="button" onClick={() => onNav('rate', selectedVenue?.id)} aria-label="Bidra"><span><Icon name="plus" /></span></button>
      <button className={cx(active === 'saved' && 'active')} type="button" onClick={() => onNav('saved')}><Icon name="heart" /><span>Lagret{savedCount ? ` ${savedCount}` : ''}</span></button>
      <button className={cx(active === 'profile' && 'active')} type="button" onClick={() => onNav('profile')}><Icon name="user" /><span>Profil</span></button>
    </nav>
  );
}

function Icon({ name }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.15, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  switch (name) {
    case 'search': return <svg {...common}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>;
    case 'home': return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /></svg>;
    case 'map': return <svg {...common}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>;
    case 'heart': return <svg {...common}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>;
    case 'user': return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case 'plus': return <svg {...common}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
    case 'back': return <svg {...common}><polyline points="15 18 9 12 15 6" /></svg>;
    case 'close': return <svg {...common}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case 'share': return <svg {...common}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /></svg>;
    default: return null;
  }
}
