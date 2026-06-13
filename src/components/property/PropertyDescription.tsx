'use client';

import { useLang } from '@/context/LangContext';

// ─────────────────────────────────────────────────────────────────────────
// PropertyDescription
// Builds a flowing, professional-reading paragraph (like pisos.com) entirely
// from the structured fields the owner submitted — no free-text needed.
// Bilingual: assembles sentences in Amharic or English based on useLang().
//
// This is purely presentational: it reads fields off `property` and composes
// sentences. It never mutates anything. If a field is missing it's skipped,
// so short listings produce short descriptions rather than awkward blanks.
// ─────────────────────────────────────────────────────────────────────────

interface Props {
  property: any;
}

// Human labels for enum-ish fields, per language.
const KIND_LABEL: Record<string, [string, string]> = {
  residential: ['residential home', 'የመኖሪያ ቤት'],
  commercial: ['commercial property', 'የንግድ ንብረት'],
  short_stay: ['short-stay property', 'የአጭር ጊዜ ማረፊያ'],
  hotel: ['hotel', 'ሆቴል'],
  guest_house: ['guest house', 'የእንግዳ ማረፊያ'],
};

const CONDITION_LABEL: Record<string, [string, string]> = {
  new: ['brand new', 'አዲስ'],
  good: ['in good condition', 'በጥሩ ሁኔታ ላይ ያለ'],
  needs_renovation: ['in need of renovation', 'እድሳት የሚያስፈልገው'],
};

const STAGE_LABEL: Record<string, [string, string]> = {
  land_only: ['land only', 'ባዶ ቦታ ብቻ'],
  foundation: ['with the foundation laid', 'መሰረቱ የወጣለት'],
  columns_erected: ['with the structure complete', 'እስትራክቸሩ ያለቀ'],
  plastering: ['at the plastering stage', 'በሲሚንቶ ደረጃ ላይ ያለ'],
  finishing: ['at the finishing stage', 'በፊኒሺንግ ደረጃ ላይ ያለ'],
  completed: ['fully completed', 'ሙሉ በሙሉ የተጠናቀቀ'],
};

const ELEC_LABEL: Record<string, [string, string]> = {
  '24hr': ['24-hour electricity', 'የ24 ሰዓት የኤሌክትሪክ አገልግሎት'],
  frequent_cuts: ['electricity with occasional cuts', 'አልፎ አልፎ መቆራረጥ ያለበት የኤሌክትሪክ አገልግሎት'],
  solar_only: ['solar power', 'የሶላር ኃይል'],
};

export function PropertyDescription({ property: p }: Props) {
  const { lang } = useLang();
  const en = lang === 'EN';
  const pick = (pair: [string, string] | undefined) => pair ? (en ? pair[0] : pair[1]) : '';

  const isRent = p.type === 'long_rent' || p.type === 'short_rent';
  const dealVerb = en
    ? (p.type === 'sale' ? 'for sale' : p.type === 'short_rent' ? 'available for short stays' : 'for rent')
    : (p.type === 'sale' ? 'ለሽያጭ' : p.type === 'short_rent' ? 'ለአጭር ጊዜ ቆይታ' : 'ለኪራይ');

  const kind = pick(KIND_LABEL[p.property_kind]) || (en ? 'property' : 'ንብረት');
  const place = [p.subcity, p.location].filter(Boolean).join(en ? ', ' : '፣ ');

  // ── Sentence 1: the headline — what, where, what deal ──
  const sentences: string[] = [];
  if (en) {
    let s1 = `This ${kind} is ${dealVerb}`;
    if (place) s1 += ` in ${place}`;
    s1 += '.';
    sentences.push(s1);
  } else {
    let s1 = `ይህ ${kind}`;
    if (place) s1 += ` በ${place}`;
    s1 += ` ${dealVerb} ቀርቧል።`;
    sentences.push(s1);
  }

  // ── Sentence 2: the core specs — rooms & area ──
  const specBits: string[] = [];
  if (p.bedrooms != null) specBits.push(en ? `${p.bedrooms} bedroom${p.bedrooms !== 1 ? 's' : ''}` : `${p.bedrooms} መኝታ ክፍል`);
  if (p.bathrooms != null) specBits.push(en ? `${p.bathrooms} bathroom${p.bathrooms !== 1 ? 's' : ''}` : `${p.bathrooms} መታጠቢያ`);
  if (p.area_sqm) specBits.push(en ? `${p.area_sqm} m² of living space` : `${p.area_sqm} ካሬ ሜትር የመኖሪያ ቦታ`);
  if (p.plot_area_sqm) specBits.push(en ? `a ${p.plot_area_sqm} m² plot` : `${p.plot_area_sqm} ካሬ ሜትር ቦታ`);
  if (specBits.length) {
    if (en) {
      const joined = specBits.length > 1
        ? specBits.slice(0, -1).join(', ') + ' and ' + specBits[specBits.length - 1]
        : specBits[0];
      sentences.push(`It offers ${joined}.`);
    } else {
      sentences.push(`${specBits.join('፣ ')} አለው።`);
    }
  }

  // ── Sentence 3: condition / construction stage ──
  const cond = pick(CONDITION_LABEL[p.condition]);
  const stage = pick(STAGE_LABEL[p.construction_stage]);
  if (cond || stage) {
    if (en) {
      const both = [cond, stage].filter(Boolean).join(', ');
      sentences.push(`The property is ${both}.`);
    } else {
      const both = [cond, stage].filter(Boolean).join('፣ ');
      sentences.push(`ንብረቱ ${both} ነው።`);
    }
  }

  // ── Sentence 4: utilities ──
  const utilBits: string[] = [];
  const elec = pick(ELEC_LABEL[p.electricity_reliability]);
  if (elec) utilBits.push(elec);
  if (p.ground_water) utilBits.push(en ? 'borehole water' : 'የጉድጓድ ውሃ');
  if (p.water_tanker) utilBits.push(en ? 'water tanker access' : 'የውሃ ታንከር አገልግሎት');
  if (p.road_type === 'asphalt') utilBits.push(en ? 'asphalt road access' : 'የአስፓልት መንገድ');
  if (utilBits.length) {
    if (en) {
      const joined = utilBits.length > 1
        ? utilBits.slice(0, -1).join(', ') + ' and ' + utilBits[utilBits.length - 1]
        : utilBits[0];
      sentences.push(`Utilities include ${joined}.`);
    } else {
      sentences.push(`አገልግሎቶች: ${utilBits.join('፣ ')}።`);
    }
  }

  // ── Sentence 5: bank loan note (sale only, meaningful detail) ──
  if (p.bank_loan_eligible) {
    sentences.push(en
      ? 'This property is eligible for a bank loan transfer to the new owner.'
      : 'ይህ ንብረት ወደ አዲሱ ባለቤት የሚተላለፍ የባንክ ብድር ድጋፍ አለው።');
  }

  // Owner's own free text, if present, shown after the generated summary.
  const ownerText: string = (p.description || '').trim();

  const generated = sentences.join(' ');

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '28px', border: '1px solid #e7e5ee' }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1830', marginBottom: 14, letterSpacing: '-0.01em' }}>
        {en ? 'Description' : 'መግለጫ'}
      </h2>
      <p style={{ fontSize: 15.5, lineHeight: 1.75, color: '#4b4960', margin: 0 }}>
        {generated}
      </p>
      {ownerText && (
        <p style={{ fontSize: 15.5, lineHeight: 1.75, color: '#4b4960', margin: '14px 0 0', whiteSpace: 'pre-line' }}>
          {ownerText}
        </p>
      )}
    </div>
  );
}
