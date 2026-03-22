document.addEventListener('DOMContentLoaded', function () {
  const reviewsContainer = document.getElementById('reviews-container');
  const duplicateContainer = document.getElementById('reviews-container-duplicate');

  if (!reviewsContainer || !duplicateContainer) return;

  const testReviews = [
    {
      text: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Suscipit, reprehenderit laboriosam nulla voluptas modi omnis, nostrum est voluptate sint tempora eos libero aperiam rerum voluptatem facilis voluptates eligendi! Aperiam, quod!',
      name: 'Olivia Bennett',
      company: 'CTO, Amplitude'
    },
    {
      text: 'Очень удобный формат работы и отличная коммуникация на всех этапах. Всё было сделано аккуратно, в срок и без лишних сложностей. Результатом полностью довольны.',
      name: 'Ethan Brooks',
      company: 'Head of Support'
    },
    {
      text: 'Понравился профессиональный подход и внимание к деталям. Команда быстро реагировала на правки и помогла довести задачу до отличного результата.',
      name: 'Ava Collins',
      company: 'CX Director'
    }
  ];

  function createReviewCard(review) {
    const card = document.createElement('div');
    card.className =
      'trusted-card p-8 rounded border border-solid border-w-100 border-opacity-[8%] bg-trust-card whitespace-normal flex flex-col justify-between min-h-[400px]';

    card.innerHTML = `
      <div>
        <p class="mt-8 mb-24 text-base text-w-100 text-fix">${review.text}</p>
      </div>
      <div class="mt-10">
        <h3 class="mt-3 mb-1 text-sm font-semibold text-w-800">${review.name}</h3>
        <h3 class="text-sm font-normal text-w-100">${review.company}</h3>
      </div>
    `;

    return card;
  }

  reviewsContainer.innerHTML = '';
  duplicateContainer.innerHTML = '';

  testReviews.forEach(function (review) {
    reviewsContainer.appendChild(createReviewCard(review));
  });

  Array.from(reviewsContainer.children).forEach(function (card) {
    duplicateContainer.appendChild(card.cloneNode(true));
  });
});
