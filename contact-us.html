export default async (request, context) => {
    if (request.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                  status: 405, headers: { 'Content-Type': 'application/json' }
          });
    }

    try {
          const body = await request.json();
          const { name, email, phone, message, honeypot } = body;

      if (honeypot) {
              return new Response(JSON.stringify({ message: 'Thank you!' }), {
                        status: 200, headers: { 'Content-Type': 'application/json' }
              });
      }

      if (!name || !message) {
              return new Response(JSON.stringify({ error: 'Name and message are required.' }), {
                        status: 400, headers: { 'Content-Type': 'application/json' }
              });
      }

      if (!email && !phone) {
              return new Response(JSON.stringify({ error: 'Please provide an email or phone number.' }), {
                        status: 400, headers: { 'Content-Type': 'application/json' }
              });
      }

      // FUTURE: Send via SendGrid/Mailgun, Slack webhook, CRM
      console.log('Contact form:', { name, email, phone, message: message.substring(0, 100) });

      return new Response(JSON.stringify({
              message: 'Thank you! We will get back to you within 24 hours.'
      }), {
              status: 200, headers: { 'Content-Type': 'application/json' }
      });

    } catch (err) {
          console.error('Contact form error:', err);
          return new Response(JSON.stringify({ error: 'Something went wrong. Please call us at 832-492-8355.' }), {
                  status: 500, headers: { 'Content-Type': 'application/json' }
          });
    }
};
