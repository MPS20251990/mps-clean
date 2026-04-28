
let reviews = [];
let visibleCount = 3;

async function loadReviews() {
    const response = await fetch('../data/reviews.json');
    reviews = await response.json();
    renderReviews();
}

function renderReviews() {
    const container = document.getElementById('reviews-list');
    container.innerHTML = '';

    reviews.slice(0, visibleCount).forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card-full';

        card.innerHTML = `
            <h3>${review.name}</h3>
            <p class="verified">Verified Customer</p>
            <p>${review.message}</p>
        `;

        container.appendChild(card);
    });

    const loadMoreBtn = document.getElementById('load-more');
    if (visibleCount >= reviews.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

document.getElementById('load-more').addEventListener('click', () => {
    visibleCount += 3;
    renderReviews();
});

loadReviews();
