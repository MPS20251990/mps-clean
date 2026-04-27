#!/usr/bin/env node
/* ═══════════════════════════════════════════
   build-reviews.js
   Merges approved reviews from pending queue
   into the main reviews.json file.

   Usage: node scripts/build-reviews.js
   ═══════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const REVIEWS_FILE = path.join(__dirname, '..', 'data', 'reviews.json');
const PENDING_FILE = path.join(__dirname, '..', 'data', 'reviews-pending.json');

function buildReviews() {
  let approved = [];
  if (fs.existsSync(REVIEWS_FILE)) {
    approved = JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf8'));
  }

  let pending = [];
  if (fs.existsSync(PENDING_FILE)) {
    pending = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
  }

  const newlyApproved = pending.filter(r => r.status === 'approved');
  const stillPending = pending.filter(r => r.status === 'pending');
  const rejected = pending.filter(r => r.status === 'rejected');

  if (newlyApproved.length === 0) {
    console.log('No new approved reviews to merge.');
    return;
  }

  approved = [...approved, ...newlyApproved];
  approved.sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(approved, null, 2));
  fs.writeFileSync(PENDING_FILE, JSON.stringify(stillPending, null, 2));

  console.log(`Merged ${newlyApproved.length} approved review(s).`);
  console.log(`${stillPending.length} review(s) still pending.`);
  console.log(`${rejected.length} review(s) rejected (removed from queue).`);
}

buildReviews();
