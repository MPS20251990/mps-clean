/* ===================================================
   submit-review.mjs — Netlify Function
   Handles new review submissions from the website.
   Saves to pending queue for manual approval.
   =================================================== */

export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { name, email, rating, text, honeypot } = body;

    // Spam check (honeypot)
    if (honeypot) {
      return new Response(JSON.stringify({ message: 'Thank you!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validation
    if (!name || !rating || !text) {
      return new Response(JSON.stringify({ error: 'Name, rating, and review text are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build review object
    const review = {
      id: `rev_${Date.now()}`,
      name: name.trim(),
      email: email ? email.trim() : null,
      rating: parseInt(rating, 10),
      text: text.trim().substring(0, 1000),
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      submitted_at: new Date().toISOString()
    };

    // ------------------------------------------------
    // FUTURE: Save to database or external store
    // For now, Netlify Forms captures the submission
    // and the owner reviews via Netlify dashboard.
    //
    // When ready, integrate with:
    //   - Airtable, Supabase, or Firebase
    //   - GitHub API to commit to reviews-pending.json
    //   - Email notification via SendGrid/Mailgun
    // ------------------------------------------------

    console.log('New review submission:', review);

    return new Response(JSON.stringify({
      message: 'Thank you for your review! It will appear after approval.',
      id: review.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Submit review error:', err);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
