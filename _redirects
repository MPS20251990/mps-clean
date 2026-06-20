export default async (request, context) => {
    if (request.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                  status: 405, headers: { 'Content-Type': 'application/json' }
          });
    }

    try {
          const authHeader = request.headers.get('Authorization');
          const expectedToken = process.env.REVIEW_ADMIN_TOKEN;

      if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
              return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                        status: 401, headers: { 'Content-Type': 'application/json' }
              });
      }

      const body = await request.json();
          const { review_id, action } = body;

      if (!review_id || !['approve', 'reject'].includes(action)) {
              return new Response(JSON.stringify({ error: 'review_id and action (approve/reject) required.' }), {
                        status: 400, headers: { 'Content-Type': 'application/json' }
              });
      }

      // FUTURE: Update review in database, trigger rebuild
      console.log(`Review ${review_id}: ${action}`);

      return new Response(JSON.stringify({
              message: `Review ${review_id} has been ${action}d.`,
              review_id, action
      }), {
              status: 200, headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
          console.error('Approve review error:', err);
          return new Response(JSON.stringify({ error: 'Something went wrong.' }), {
                  status: 500, headers: { 'Content-Type': 'application/json' }
          });
    }
};
