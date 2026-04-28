document.addEventListener('DOMContentLoaded', function() {
  loadApprovedReviews();
});

function loadApprovedReviews() {
  var container = document.getElementById('reviews-container');
  if (!container) return;

  fetch('/data/reviews.json')
    .then(function(res) { return res.json(); })
    .then(function(reviews) {
      container.innerHTML = reviews.slice(0, 5).map(function(r) {
        var stars = '';
        var i;
        for (i = 0; i < r.rating; i++) { stars += '\u2605'; }
        for (i = r.rating; i < 5; i++) { stars += '\u2606'; }
        return '<div class="review-card">' +
          '<div class="stars">' + stars + '</div>' +
          '<p>' + escapeHtml(r.text) + '</p>' +
          '<p class="author">\u2014 ' + escapeHtml(r.name) + '</p>' +
          '</div>';
      }).join('');
    })
    .catch(function(err) {
      console.error('Reviews load error:', err);
      container.innerHTML = '<p>Reviews coming soon.</p>';
    });
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
// CONTACT FORM HANDLER
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formStatus = document.getElementById('form-status');
        formStatus.textContent = "Sending...";

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('/.netlify/functions/contact-form', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response.ok) {
            formStatus.textContent = "Message sent! I'll get back to you shortly.";
            contactForm.reset();
        } else {
            formStatus.textContent = "Something went wrong. Please try again.";
        }
    });
}
