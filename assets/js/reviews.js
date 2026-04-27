
fetch('/assets/data/reviews.json')
  .then(res => res.json())
  .then(data => {
    const preview = document.getElementById('review-preview');
    const fullList = document.getElementById('reviews-container');

    if (preview) {
      data.slice(0, 3).forEach(r => {
        preview.innerHTML += `
          <div class="review-card">
            <strong>${r.name}</strong><br>
            ⭐⭐⭐⭐⭐<br>
            <p>${r.text}</p>
          </div>
        `;
      });
    }

    if (fullList) {
      data.forEach(r => {
        fullList.innerHTML += `
          <div class="review-card">
            <strong>${r.name}</strong><br>
            ⭐⭐⭐⭐⭐<br>
            <p>${r.text}</p>
          </div>
        `;
      });
    }
  })
  .catch(err => console.error('Review load error:', err));
