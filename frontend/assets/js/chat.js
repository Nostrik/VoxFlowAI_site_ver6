document.addEventListener('DOMContentLoaded', function () {

  // Основные элементы чата
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendMessageBtn = document.getElementById('send-message');

  // Защита: если элементы не найдены — прекращаем выполнение
  if (!chatMessages || !chatInput || !sendMessageBtn) return;

  /**
   * Защита от XSS.
   * Экранирует HTML, чтобы пользователь не мог вставить JS или HTML код
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Добавляет сообщение пользователя (справа)
   */
  function addUserMessage(text) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'flex items-end justify-end w-full gap-2';
    messageWrapper.innerHTML = `
      <p class="p-3 w-auto sm:max-w-[232px] text-left rounded rounded-br-none text-sm md:text-base bg-chat-primary text-w-300">
        ${escapeHtml(text)}
      </p>
      <img src="assets/img/chatuser1.svg" alt="chatuser1.svg" />
    `;
    chatMessages.appendChild(messageWrapper);
  }

  /**
   * Добавляет сообщение бота (слева)
   */
  function addBotMessage(text) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'flex items-end justify-start gap-2';
    messageWrapper.innerHTML = `
      <img src="assets/img/chatuser2.svg" alt="chatbot-avatar" />
      <p class="p-3 w-auto sm:max-w-[216px] text-left rounded rounded-bl-none text-sm md:text-base bg-chat-secondary text-w-300">
        ${escapeHtml(text)}
      </p>
    `;
    chatMessages.appendChild(messageWrapper);
  }

  /**
   * Прокручивает чат вниз
   */
  function scrollChatToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Основная функция отправки сообщения
   */
  function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // Добавляем сообщение пользователя
    addUserMessage(text);
    chatInput.value = '';
    scrollChatToBottom();
    chatInput.focus();


    /**
     * Эхо-ответ бота
     * Через небольшую задержку для имитации "мышления"
     */
    setTimeout(() => {
      addBotMessage(`Инстересно: ${text}`);
      addBotMessage(`Могу предложить связаться с нами, если нужно больше деталей.`);
      scrollChatToBottom();
    }, 700);
  }

  /**
   * Клик по кнопке отправки
   */
  sendMessageBtn.addEventListener('click', handleSendMessage);

  /**
   * Отправка по Enter
   */
  chatInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();

    }
  });
});