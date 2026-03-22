document.addEventListener('DOMContentLoaded', async () => {
    const reviewsContainer = document.getElementById('reviews-container');
    const duplicateContainer = document.getElementById('reviews-container-duplicate');

    if (!reviewsContainer || !duplicateContainer) return;

    function escapeHtml(str) {
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function createReviewCard(review) {
        const card = document.createElement('div');
        card.className =
            'trusted-card p-8 rounded border border-solid border-w-100 border-opacity-[8%] bg-trust-card whitespace-normal flex flex-col justify-between min-h-[400px]';

        card.innerHTML = `
            <div>
                <p class="mt-8 mb-24 text-base text-w-100 text-fix">
                    ${escapeHtml(review.review_text || '')}
                </p>
            </div>
            <div class="mt-10">
                <h3 class="mt-3 mb-1 text-sm font-semibold text-w-800">
                    ${escapeHtml(review.name || 'Анонимно')}
                </h3>
                <h3 class="text-sm font-normal text-w-100">
                    ${escapeHtml(review.company || '')}
                </h3>
            </div>
        `;

        return card;
    }

    try {
        const response = await fetch('/api/reviews/published');

        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }

        const reviews = await response.json();

        reviewsContainer.innerHTML = '';
        duplicateContainer.innerHTML = '';

        if (!Array.isArray(reviews) || reviews.length === 0) {
            reviewsContainer.innerHTML = `
                <p class="text-w-100 text-base whitespace-normal">
                    Пока нет опубликованных отзывов.
                </p>
            `;
            return;
        }

        reviews.forEach(review => {
            reviewsContainer.appendChild(createReviewCard(review));
        });

        Array.from(reviewsContainer.children).forEach(card => {
            duplicateContainer.appendChild(card.cloneNode(true));
        });
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        reviewsContainer.innerHTML = `
            <p class="text-red-400 text-base whitespace-normal">
                Не удалось загрузить отзывы.
            </p>
        `;
    }
});