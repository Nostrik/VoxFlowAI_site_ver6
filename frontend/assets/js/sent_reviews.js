document.addEventListener('DOMContentLoaded', () => {
    const formCard = document.getElementById('form-card');
    const formElement = document.getElementById('review-form');

    const successCard = document.getElementById('success-modal');
    const closeSuccess = document.getElementById('close-success');

    const formMessage = document.getElementById('form-message');
    const closeMessage = document.getElementById('close-message');

    function hideFormCard() {
        if (formCard) {
            formCard.classList.add('hidden');
        }
    }

    function showSuccessState() {
        hideFormCard();

        if (successCard) {
            successCard.classList.remove('hidden');
        }
    }

    function setMessage(text, isError = false) {
        if (!formMessage) return;

        formMessage.textContent = text;
        formMessage.style.color = isError ? '#ff6b6b' : '#ffffff';
    }

    if (formElement) {
        formElement.addEventListener('submit', async (e) => {
            e.preventDefault();

            setMessage('');

            const payload = {
                review_text: document.getElementById('review').value,
                name: document.getElementById('name').value,
                company: document.getElementById('company').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
            };

            try {
                const res = await fetch('/api/reviews/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                // const res = {ok: 'True'};

                if (!res.ok) {
                    const rawText = await res.text();
                    let message = 'Ошибка сервера';

                    if (rawText) {
                        try {
                            const errorData = JSON.parse(rawText);
                            message =
                                errorData.detail ||
                                errorData.message ||
                                JSON.stringify(errorData);
                        } catch {
                            message = rawText;
                        }
                    }

                    throw new Error(message);
                }

                // успех
                formElement.reset();
                showSuccessState();

            } catch (err) {
                console.error(err);

                // форма остаётся на месте, только показываем ошибку
                setMessage(err.message || 'Ошибка сервера', true);
            }
        });
    }

    // крестик в success-modal
    if (closeSuccess) {
        closeSuccess.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // если есть крестик у текста ошибки в форме
    if (closeMessage) {
        closeMessage.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});