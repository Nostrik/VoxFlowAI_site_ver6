//   document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('contact-form');
//     const successMessage = document.getElementById('form-success-message');

//     if (!form) return;

//     form.addEventListener('submit', (e) => {
//       e.preventDefault(); // запрещает обновление страницы

//       form.reset();

//       if (successMessage) {
//         successMessage.classList.remove('hidden');
//       }
//     });
//   });

document.addEventListener('DOMContentLoaded', () => {
    const formElement = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (!formElement) return;

    function setMessage(text) {
        if (formMessage) {
            formMessage.textContent = text;
        }
    }

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

            formElement.reset();
            setMessage('Данные успешно отправлены');
        } catch (err) {
            console.error(err);
            setMessage(err.message || 'Ошибка сервера');
        }
    });
});