document.addEventListener('DOMContentLoaded', function () {
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendMessageBtn = document.getElementById('send-message');

  if (!chatMessages || !chatInput || !sendMessageBtn) {
    console.error('[TwinChat] Не найдены элементы чата');
    return;
  }

  const TWIN_CONFIG = {
    chatId: '3584817c-13f7-426d-afa8-c6acb1788a79',
    companyId: '15778',
    baseUrl: 'https://twin24.ai',
    widgetQuery: 'x_widget=1',
    debug: true,
  };

  let typingInterval = null;
  let isSending = false;

  let twinSessionId = localStorage.getItem('twin_session_id') || '';
  let twinClientExternalId =
    // localStorage.getItem('twin_client_external_id') || crypto.randomUUID();
    localStorage.getItem('twin_client_external_id') || 'cecb55e9-5ad0-4eb7-8afe-cd2a0b0e2b04';

  localStorage.setItem('twin_client_external_id', twinClientExternalId);

  const renderedMessageIds = new Set();

  function log(...args) {
    if (TWIN_CONFIG.debug) {
      console.log('[TwinChat]', ...args);
    }
  }

  function errorLog(...args) {
    console.error('[TwinChat]', ...args);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function scrollChatToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addUserMessage(text) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'flex items-end justify-end w-full gap-2';
    messageWrapper.innerHTML = `
      <p class="p-3 w-auto sm:max-w-[270px] text-left rounded rounded-br-none text-sm md:text-base bg-chat-primary text-w-300">
        ${escapeHtml(text)}
      </p>
      <img src="assets/img/chatuser1.svg" alt="chatuser1.svg" />
    `;
    chatMessages.appendChild(messageWrapper);
  }

  function addBotMessage(text) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'flex items-end justify-start gap-2';
    messageWrapper.innerHTML = `
      <img src="assets/img/chatuser2.svg" alt="chatbot-avatar" />
      <p class="p-3 w-auto sm:max-w-[240px] text-left rounded rounded-bl-none text-sm md:text-base bg-chat-secondary text-w-300">
        ${(text)}
      </p>
    `;
    chatMessages.appendChild(messageWrapper);
  }

  function showTypingIndicator() {
    removeTypingIndicator();

    const typingWrapper = document.createElement('div');
    typingWrapper.className = 'flex items-end justify-start gap-2';
    typingWrapper.id = 'typing-indicator';

    typingWrapper.innerHTML = `
      <img src="assets/img/chatuser2.svg" alt="chatbot-avatar" />
      <p id="typing-text" class="p-3 w-auto sm:max-w-[240px] text-left rounded rounded-bl-none text-sm md:text-base bg-chat-secondary text-w-300 italic">
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

    scrollChatToBottom();
  }

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

  function saveSessionId(sessionId) {
    twinSessionId = sessionId;
    localStorage.setItem('twin_session_id', sessionId);
    log('Сохранили sessionId:', sessionId);
  }

  async function createOrRestoreSession() {
    const url = `${TWIN_CONFIG.baseUrl}/chats/api/v1/chats/${TWIN_CONFIG.chatId}/sessions?${TWIN_CONFIG.widgetQuery}`;

    const payload = {
      clientExternalId: twinClientExternalId,
      recreateOnExists: true,
      returnAnswerAsync: true,
      sessionId: twinSessionId || undefined,
    };

    log('Создаём/восстанавливаем сессию');
    log('PUT', url);
    log('Payload:', payload);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    log('Ответ sessions status:', response.status);

    const data = await response.json().catch(() => null);
    log('Ответ sessions body:', data);

    if (!response.ok) {
      throw new Error(`Ошибка создания сессии: ${response.status}`);
    }

    if (!data || !data.id) {
      throw new Error('Twin не вернул sessionId');
    }

    saveSessionId(data.id);
    return data;
  }

  async function sendMessageToTwin(text) {
    if (!twinSessionId) {
      await createOrRestoreSession();
    }

    const url = `${TWIN_CONFIG.baseUrl}/chats/api/v1/sessions/${twinSessionId}/clients/messages?${TWIN_CONFIG.widgetQuery}`;

    const payload = {
      attachments: [],
      body: text,
    };

    log('Отправляем сообщение');
    log('POST', url);
    log('Payload:', payload);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    log('Ответ sendMessage status:', response.status);

    const data = await response.json().catch(() => null);
    log('Ответ sendMessage body:', data);

    if (!response.ok) {
      throw new Error(`Ошибка отправки сообщения: ${response.status}`);
    }

    return data;
  }

//   async function fetchMessages() {
//     const url = `${TWIN_CONFIG.baseUrl}/analyse/api/v1/statistics/chat/messages?${TWIN_CONFIG.widgetQuery}&chatId=${encodeURIComponent(TWIN_CONFIG.chatId)}&sessionId=${encodeURIComponent(twinSessionId)}&limit=50&offset=0`;

//     log('Запрашиваем историю');
//     log('GET', url);

//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//       },
//     });

//     log('Ответ fetchMessages status:', response.status);

//     const data = await response.json().catch(() => null);
//     log('Ответ fetchMessages body:', data);

//     if (!response.ok) {
//       throw new Error(`Ошибка получения истории: ${response.status}`);
//     }

//     return data;
//   }

    async function fetchMessages() {
    const url = new URL(`${TWIN_CONFIG.baseUrl}/analyse/api/v1/statistics/chat/messages`);

    url.searchParams.set('x_widget', '1');
    url.searchParams.set('chatId', TWIN_CONFIG.chatId);
    url.searchParams.set('companyId', TWIN_CONFIG.companyId);
    url.searchParams.set('withClientExternalId', twinClientExternalId);
    url.searchParams.set('sort', '-createdAt');
    url.searchParams.set('offset', '0');
    url.searchParams.set('limit', '20');

    log('Запрашиваем историю');
    log('GET', url.toString());

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
        'Accept': 'application/json',
        },
    });

    log('Ответ fetchMessages status:', response.status);

    const data = await response.json().catch(() => null);
    log('Ответ fetchMessages body:', data);

    if (!response.ok) {
        throw new Error(`Ошибка получения истории: ${response.status}`);
    }

    return data;
    }

  function extractBotMessages(data) {
    if (!data || !Array.isArray(data.items)) {
      log('История не содержит items[]');
      return [];
    }

    const botMessages = data.items.filter((item) => {
      return (
        item &&
        item.authorType === 'BOT' &&
        item.body &&
        item.sessionId === twinSessionId
      );
    });

    log('Найдено BOT-сообщений:', botMessages.length);
    return botMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  function renderNewBotMessages(messages) {
    let rendered = 0;

    for (const item of messages) {
      if (renderedMessageIds.has(item.id)) continue;

      log('Рендерим сообщение бота:', item.id, item.body);

      removeTypingIndicator();
      addBotMessage(item.body);
      renderedMessageIds.add(item.id);
      rendered++;
    }

    if (rendered > 0) {
      scrollChatToBottom();
    }

    return rendered;
  }

  async function waitForBotReply(maxAttempts = 20, delay = 2000) {
    log('Начинаем ожидание ответа бота');

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      log(`Попытка ${attempt}/${maxAttempts}`);

      try {
        const history = await fetchMessages();
        const botMessages = extractBotMessages(history);
        const renderedCount = renderNewBotMessages(botMessages);

        if (renderedCount > 0) {
          log('Ответ бота получен');
          return true;
        }
      } catch (err) {
        errorLog('Ошибка при ожидании ответа:', err);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    log('Ответ бота не найден за отведённое время');
    return false;
  }

  async function initTwinChat() {
    try {
      log('Инициализация чата');

      await createOrRestoreSession();

      const history = await fetchMessages();
      const botMessages = extractBotMessages(history);

      // Помечаем старые сообщения как уже существующие, чтобы не дублировать
      for (const item of botMessages) {
        renderedMessageIds.add(item.id);
      }

      log('Инициализация завершена');
    } catch (err) {
      errorLog('Ошибка инициализации:', err);
    }
  }

  async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text || isSending) return;

    isSending = true;

    try {
      log('---');
      log('Пользователь отправляет:', text);

      addUserMessage(text);
      chatInput.value = '';
      chatInput.focus();
      scrollChatToBottom();

      showTypingIndicator();

      await createOrRestoreSession();
      await sendMessageToTwin(text);

      const gotReply = await waitForBotReply(20, 2000);

      if (!gotReply) {
        removeTypingIndicator();
        addBotMessage('Не удалось дождаться ответа. Попробуйте ещё раз.');
        scrollChatToBottom();
      }
    } catch (err) {
      errorLog('Ошибка handleSendMessage:', err);
      removeTypingIndicator();
      addBotMessage('Ошибка соединения с сервером. Попробуйте позже.');
      scrollChatToBottom();
    } finally {
      isSending = false;
    }
  }

  sendMessageBtn.addEventListener('click', handleSendMessage);

  chatInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  });

  initTwinChat();
});