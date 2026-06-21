import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FIELD_LIMITS,
  buildLeadDocument,
  createLeadId,
  forwardVerifiedSubmission,
  getSubmissionFromEventBody,
  normalizeEmail,
  normalizePhone
} from '../netlify/functions/submission-created.mjs';

const submittedAt = '2026-06-21T14:30:00.000Z';
const now = new Date('2026-06-21T15:00:00.000Z');

function contactSubmission(overrides = {}) {
  return {
    id: 'submission-123',
    form_name: 'contact',
    created_at: submittedAt,
    data: {
      name: '  Jane   Smith  ',
      email: '  JANE@Example.COM ',
      phone: '(832) 555-0123',
      message: '  Interested in weekly service.  '
    },
    ...overrides
  };
}

test('builds the required normalized lead schema', () => {
  const result = buildLeadDocument(contactSubmission(), now);

  assert.equal(result.lead.id, createLeadId('submission-123'));
  assert.equal(result.lead.email, 'jane@example.com');
  assert.equal(result.lead.phone, '+18325550123');
  assert.equal(result.lead.status, 'New');
  assert.equal(result.lead.submittedAt.toISOString(), submittedAt);
  assert.equal(result.lead.convertedCustomerId, null);
});

test('ignores non-contact forms', () => {
  assert.deepEqual(
    buildLeadDocument(contactSubmission({ form_name: 'review' }), now),
    { skipped: true, reason: 'unmatched-form', formName: 'review' }
  );
});

test('requires an id and required lead fields', () => {
  assert.throws(
    () => buildLeadDocument(contactSubmission({ id: '' }), now),
    /stable Netlify submission ID/
  );
  assert.throws(
    () => buildLeadDocument(
      contactSubmission({ data: { name: '', email: '', phone: '', message: '' } }),
      now
    ),
    /missing required lead fields/
  );
});

test('extracts the Netlify submission event envelope', () => {
  const submission = contactSubmission();
  assert.equal(getSubmissionFromEventBody({ payload: submission }), submission);
  assert.equal(getSubmissionFromEventBody(submission), submission);
});

test('enforces field limits', () => {
  const result = buildLeadDocument(
    contactSubmission({
      data: {
        name: 'n'.repeat(FIELD_LIMITS.name + 20),
        email: `${'e'.repeat(FIELD_LIMITS.email + 20)}@example.com`,
        phone: `+${'1'.repeat(FIELD_LIMITS.phone + 20)}`,
        message: 'm'.repeat(FIELD_LIMITS.message + 20)
      }
    }),
    now
  );

  assert.equal(result.lead.name.length, FIELD_LIMITS.name);
  assert.ok(result.lead.email.length <= FIELD_LIMITS.email);
  assert.ok(result.lead.phone.length <= FIELD_LIMITS.phone);
  assert.equal(result.lead.message.length, FIELD_LIMITS.message);
});

test('normalizes common contact formats', () => {
  assert.equal(normalizeEmail(' Test@Example.COM '), 'test@example.com');
  assert.equal(normalizePhone('832.555.0123'), '+18325550123');
  assert.equal(normalizePhone('+44 20 7946 0958'), '+442079460958');
});

test('uses deterministic ids with an injected idempotent writer', async () => {
  const writes = [];
  const writer = async (ownerUid, id, lead) => {
    writes.push({ ownerUid, id, lead });
    return { created: writes.length === 1, duplicate: writes.length > 1 };
  };

  const first = await forwardVerifiedSubmission(contactSubmission(), {
    ownerUid: 'owner-uid',
    writer,
    now
  });
  const second = await forwardVerifiedSubmission(contactSubmission(), {
    ownerUid: 'owner-uid',
    writer,
    now
  });

  assert.equal(first.id, second.id);
  assert.equal(first.created, true);
  assert.equal(second.duplicate, true);
});
