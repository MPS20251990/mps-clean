import { createHash } from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const CONTACT_FORM_NAME = 'contact';

export const FIELD_LIMITS = Object.freeze({
  name: 160,
  email: 320,
  phone: 32,
  message: 5000
});

function normalizeSingleLine(value, maxLength) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeMessage(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, FIELD_LIMITS.message);
}

export function normalizeEmail(value) {
  return normalizeSingleLine(value, FIELD_LIMITS.email).toLowerCase();
}

export function normalizePhone(value) {
  const raw = normalizeSingleLine(value, FIELD_LIMITS.phone);
  if (!raw) return '';

  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `${raw.startsWith('+') ? '+' : ''}${digits}`.slice(0, FIELD_LIMITS.phone);
}

function getSubmissionFields(submission) {
  if (submission?.data && typeof submission.data === 'object') return submission.data;
  if (submission?.payload?.data && typeof submission.payload.data === 'object') {
    return submission.payload.data;
  }
  return {};
}

export function getFormName(submission) {
  const fields = getSubmissionFields(submission);
  return normalizeSingleLine(
    submission?.form_name ??
      submission?.formName ??
      submission?.form?.name ??
      fields['form-name'] ??
      fields.formName,
    80
  ).toLowerCase();
}

export function getSubmissionId(submission) {
  return normalizeSingleLine(
    submission?.id ??
      submission?.submissionId ??
      submission?.submission_id ??
      submission?.uuid,
    256
  );
}

export function createLeadId(submissionId) {
  if (!submissionId) throw new Error('Netlify submission ID is required.');
  const digest = createHash('sha256').update(submissionId).digest('hex');
  return `web_${digest.slice(0, 40)}`;
}

function parseSubmittedAt(submission, fallbackDate) {
  const value =
    submission?.created_at ??
    submission?.createdAt ??
    submission?.submitted_at ??
    submission?.submittedAt;
  const parsed = value ? new Date(value) : fallbackDate;
  return Number.isNaN(parsed.getTime()) ? fallbackDate : parsed;
}

export function buildLeadDocument(submission, now = new Date()) {
  const formName = getFormName(submission);
  if (formName !== CONTACT_FORM_NAME) {
    return { skipped: true, reason: 'unmatched-form', formName };
  }

  const submissionId = getSubmissionId(submission);
  if (!submissionId) {
    throw new Error('Verified contact submission is missing a stable Netlify submission ID.');
  }

  const fields = getSubmissionFields(submission);
  const id = createLeadId(submissionId);
  const timestamp = new Date(now);
  const name = normalizeSingleLine(fields.name, FIELD_LIMITS.name);
  const email = normalizeEmail(fields.email);
  const phone = normalizePhone(fields.phone);
  const message = normalizeMessage(fields.message);

  if (!name || !message || (!email && !phone)) {
    throw new Error('Contact submission is missing required lead fields.');
  }

  return {
    skipped: false,
    id,
    lead: {
      id,
      schemaVersion: 1,
      name,
      email,
      phone,
      message,
      source: 'website',
      formName: CONTACT_FORM_NAME,
      submissionId,
      status: 'New',
      notes: '',
      internalNotes: '',
      submittedAt: parseSubmittedAt(submission, timestamp),
      createdAt: timestamp,
      updatedAt: timestamp,
      convertedCustomerId: null,
      convertedAt: null
    }
  };
}

function requireEnvironment(name) {
  const value = String(process.env[name] ?? '').trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const projectId = requireEnvironment('FIREBASE_PROJECT_ID');
  const clientEmail = requireEnvironment('FIREBASE_CLIENT_EMAIL');
  const privateKey = requireEnvironment('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId
  });
}

async function createLeadIfMissing(ownerUid, id, lead) {
  const firestore = getFirestore(getAdminApp());
  const reference = firestore
    .collection('mclean_field_os')
    .doc(ownerUid)
    .collection('websiteLeads')
    .doc(id);

  try {
    await reference.create(lead);
    return { created: true, duplicate: false };
  } catch (error) {
    if (error?.code === 6 || error?.code === '6' || error?.code === 'already-exists') {
      return { created: false, duplicate: true };
    }
    throw error;
  }
}

export async function forwardVerifiedSubmission(submission, options = {}) {
  const result = buildLeadDocument(submission, options.now ?? new Date());
  if (result.skipped) return result;

  const ownerUid = options.ownerUid ?? requireEnvironment('FIELD_OS_OWNER_UID');
  const writer = options.writer ?? createLeadIfMissing;
  const writeResult = await writer(ownerUid, result.id, result.lead);

  return { ...result, ...writeResult };
}

export function getSubmissionFromEventBody(body) {
  if (body?.payload && typeof body.payload === 'object') return body.payload;
  if (body && typeof body === 'object') return body;
  throw new Error('Invalid Netlify submission event payload.');
}

export default async function submissionCreated(request) {
  const body = await request.json();
  const submission = getSubmissionFromEventBody(body);
  const result = await forwardVerifiedSubmission(submission);

  if (result.skipped) {
    console.log('[website-leads] Ignored non-contact form submission.');
    return;
  }

  console.log(
    result.duplicate
      ? `[website-leads] Duplicate submission ignored: ${result.id}`
      : `[website-leads] Lead created: ${result.id}`
  );
}
