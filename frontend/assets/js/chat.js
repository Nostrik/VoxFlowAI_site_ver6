document.addEventListener('DOMContentLoaded', function () {

  // Основные элементы чата
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendMessageBtn = document.getElementById('send-message');

  // Защита: если элементы не найдены — прекращаем выполнение
  if (!chatMessages || !chatInput || !sendMessageBtn) return;

  let typingInterval = null;

  /**
   * Защита от XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Сообщение пользователя
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
   * Сообщение бота
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
   * Показ анимации точек
   */
  function showTypingIndicator() {
    const typingWrapper = document.createElement('div');
    typingWrapper.className = 'flex items-end justify-start gap-2';
    typingWrapper.id = 'typing-indicator';

    typingWrapper.innerHTML = `
      <img src="assets/img/chatuser2.svg" alt="chatbot-avatar" />
      <p id="typing-text" class="p-3 w-auto sm:max-w-[216px] text-left rounded rounded-bl-none text-sm md:text-base bg-chat-secondary text-w-300 italic">
        .
      </p>
    `;

    chatMessages.appendChild(typingWrapper);

    const typingText = typingWrapper.querySelector('#typing-text');

    let dots = 1;

    typingInterval = setInterval(() => {
      dots = (dots % 3) + 1;
      typingText.textContent = '.'.repeat(dots);
    }, 400);
  }

  /**
   * Удаление анимации
   */
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');

    if (typingInterval) {
      clearInterval(typingInterval);
      typingInterval = null;
    }

    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  /**
   * Скролл вниз
   */
  function scrollChatToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Отправка сообщения
   */
  function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // сообщение пользователя
    addUserMessage(text);
    chatInput.value = '';
    scrollChatToBottom();
    chatInput.focus();

    // показываем точки
    showTypingIndicator();
    scrollChatToBottom();

    // имитация ответа бота
    setTimeout(() => {
      removeTypingIndicator();

      addBotMessage(`Интересно: ${text}`);
      addBotMessage(`Могу предложить связаться с нами, если нужно больше деталей.`);

      scrollChatToBottom();
    }, 3000);
  }

  /**
   * Клик
   */
  sendMessageBtn.addEventListener('click', handleSendMessage);

  /**
   * Enter
   */
  chatInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  });

});