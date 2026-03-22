document.addEventListener('DOMContentLoaded', () => {
    const formCard = document.getElementById('form-card');
    const formElement = document.getElementById('form');

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

        // цвет текста
        if (isError) {
            formMessage.style.color = '#ff6b6b'; // красный
        } else {
            formMessage.style.color = '#ffffff'; // белый (или твой стиль)
        }
    }

    if (closeMessage) {
        closeMessage.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    if (formElement) {
        formElement.addEventListener('submit', async (e) => {
            e.preventDefault();

            setMessage('');

            const payload = {
                description: document.getElementById('description').value,
                name: document.getElementById('name').value,
                company: document.getElementById('company').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
            };

            try {
                const res = await fetch('/api/leads/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                // const res = { ok: true };

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

                // ✅ УСПЕХ
                formElement.reset();
                showSuccessState();

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);

            } catch (err) {
                console.error(err);

                // ❌ ОШИБКА — форма остаётся, просто показываем текст
                setMessage(err.message || 'Ошибка сервера', true);
            }
        });
    }

    if (closeSuccess) {
        closeSuccess.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});