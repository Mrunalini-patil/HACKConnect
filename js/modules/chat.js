/**
 * Chat module with persistent inbox + notifications.
 */

let currentChatPartner = null;
let currentInboxPartnerId = null;
let currentRecipientPartner = null;
const pendingReplyTimers = {};

function getThreads() {
  return HackConnectApp.getChatThreads();
}

function saveThreads(threads) {
  HackConnectApp.saveChatThreads(threads);
}

function getNotifications() {
  return HackConnectApp.getChatNotifications();
}

function saveNotifications(notifications) {
  HackConnectApp.saveChatNotifications(notifications);
}

function getPartnerById(personId) {
  return (HackConnectApp.TEAMMATES || []).find((person) => person.id === personId) || null;
}

function ensureThread(person) {
  const threads = getThreads();
  if (!threads[person.id]) {
    threads[person.id] = [];
    saveThreads(threads);
  }
  return threads;
}

function addMessage(person, sender, text) {
  const threads = ensureThread(person);
  const nextMessage = {
    sender,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    timestamp: Date.now()
  };
  threads[person.id].push(nextMessage);
  saveThreads(threads);
  return nextMessage;
}

function addChatNotification(person, text) {
  const notifications = getNotifications();
  notifications.unshift({
    id: `${person.id}-${Date.now()}`,
    personId: person.id,
    text,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    read: false,
    type: "message"
  });
  saveNotifications(notifications.slice(0, 20));
}

function getMessageOwnerLabel(sender, perspective) {
  if (perspective === "recipient") {
    return sender === "partner" ? "user-message" : "partner-message";
  }
  return sender === "user" ? "user-message" : "partner-message";
}

function getUnreadMessageCount() {
  return getNotifications().filter((item) => item.type === "message" && !item.read).length;
}

function markNotificationsForPersonRead(personId) {
  const next = getNotifications().map((item) => (
    item.type === "message" && item.personId === personId
      ? { ...item, read: true }
      : item
  ));
  saveNotifications(next);
}

function markAllMessageNotificationsRead() {
  const next = getNotifications().map((item) => (
    item.type === "message"
      ? { ...item, read: true }
      : item
  ));
  saveNotifications(next);
}

function buildAutoReply(person, userText) {
  const text = userText.toLowerCase();

  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return `Hey! Thanks for reaching out. I am interested in chatting more about teaming up for this project.`;
  }
  if (text.includes("hackathon") || text.includes("team")) {
    return `That sounds good to me. I am open to discussing the hackathon plan and seeing whether our skills fit well together.`;
  }
  if (text.includes("skills") || text.includes("stack") || text.includes("build")) {
    return `I usually work on ${person.skills.slice(0, 2).join(" and ")}. Happy to talk through what you are building.`;
  }
  if (text.includes("time") || text.includes("available") || text.includes("schedule")) {
    return `My current availability is ${person.availability.toLowerCase()}. We can work out a timing that fits.`;
  }

  return `Thanks for the message. I would be happy to continue the conversation and learn more about what you want to build.`;
}

function syncOpenViews(personId) {
  if (currentChatPartner?.id === personId) {
    renderChatMessages();
  }
  if (currentInboxPartnerId === personId) {
    renderInboxThread(personId);
  }
  renderMessagesInbox();
  window.renderNotifications?.();
}

function scheduleAutoReply(person, userText) {
  if (pendingReplyTimers[person.id]) {
    clearTimeout(pendingReplyTimers[person.id]);
  }

  pendingReplyTimers[person.id] = setTimeout(() => {
    const replyText = buildAutoReply(person, userText);
    addMessage(person, "partner", replyText);
    addChatNotification(person, replyText);
    syncOpenViews(person.id);
    delete pendingReplyTimers[person.id];
  }, 900);
}

function renderChatMessages() {
  if (!currentChatPartner) return;

  const messagesContainer = document.getElementById("chatMessages");
  const threads = getThreads();
  const messages = threads[currentChatPartner.id] || [];

  if (!messages.length) {
    messagesContainer.innerHTML = `
      <div class="chat-welcome">
        <h4>Start a conversation with ${currentChatPartner.name}</h4>
        <p>Type a message and the teammate will send an automated reply for now.</p>
      </div>
    `;
    return;
  }

  messagesContainer.innerHTML = messages
    .map((msg) => `
      <div class="chat-message ${getMessageOwnerLabel(msg.sender, "user")}">
        <div class="chat-message-content">${msg.text}</div>
        <small class="chat-message-time">${msg.time}</small>
      </div>
    `)
    .join("");

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderRecipientInbox() {
  if (!currentRecipientPartner) return;

  const messagesContainer = document.getElementById("recipientInboxMessages");
  const threads = getThreads();
  const messages = threads[currentRecipientPartner.id] || [];

  document.getElementById("recipientInboxName").textContent = `${currentRecipientPartner.name}'s Inbox`;
  document.getElementById("recipientInboxRole").textContent = `Sent messages preview for ${currentRecipientPartner.role}`;

  if (!messages.length) {
    messagesContainer.innerHTML = `
      <div class="chat-welcome">
        <h4>No messages for ${currentRecipientPartner.name} yet</h4>
        <p>Send a message first to see it appear here.</p>
      </div>
    `;
    return;
  }

  messagesContainer.innerHTML = messages
    .map((msg) => `
      <div class="chat-message ${getMessageOwnerLabel(msg.sender, "recipient")}">
        <div class="chat-message-content">${msg.text}</div>
        <small class="chat-message-time">${msg.time}</small>
      </div>
    `)
    .join("");

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function renderMessagesInbox() {
  const inbox = document.getElementById("messagesInboxList");
  const pill = document.getElementById("messagesUnreadPill");
  const count = document.getElementById("messagesCount");
  if (!inbox || !pill || !count) return;

  const threads = getThreads();
  const threadIds = Object.keys(threads)
    .filter((personId) => (threads[personId] || []).length)
    .sort((a, b) => (threads[b].at(-1)?.timestamp || 0) - (threads[a].at(-1)?.timestamp || 0));
  const visibleThreadIds = currentInboxPartnerId && !threadIds.includes(currentInboxPartnerId) && threads[currentInboxPartnerId]
    ? [currentInboxPartnerId, ...threadIds]
    : threadIds;

  const unreadCount = getUnreadMessageCount();
  pill.textContent = `${unreadCount} unread`;
  count.textContent = String(unreadCount);

  if (!visibleThreadIds.length) {
    inbox.innerHTML = `<div class="empty-state"><p>No messages yet. Open a teammate profile and send a message to start a thread.</p></div>`;
    return;
  }

  const notifications = getNotifications();
  inbox.innerHTML = visibleThreadIds.map((personId) => {
    const person = getPartnerById(personId);
    const lastMessage = threads[personId].at(-1);
    const unreadForPerson = notifications.filter((item) => item.type === "message" && item.personId === personId && !item.read).length;
    return `
      <div class="message-thread-item ${currentInboxPartnerId === personId ? "active" : ""}" data-message-thread="${personId}">
        <div class="message-thread-top">
          <div class="message-thread-name">${person?.name || personId}</div>
          <div class="message-thread-time">${lastMessage?.time || ""}</div>
        </div>
        <div class="muted-copy" style="margin-bottom: 0.4rem;">${person?.role || "Teammate"}</div>
        <div class="message-thread-meta">
          <div class="message-thread-preview">${lastMessage?.text || "No messages yet."}</div>
          ${unreadForPerson ? `<span class="message-unread-badge">${unreadForPerson}</span>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

function renderInboxThread(personId) {
  const threadView = document.getElementById("messagesThreadView");
  const emptyView = document.getElementById("messagesThreadEmpty");
  const nameEl = document.getElementById("messagesThreadName");
  const roleEl = document.getElementById("messagesThreadRole");
  const messagesEl = document.getElementById("messagesThreadMessages");
  if (!threadView || !emptyView || !nameEl || !roleEl || !messagesEl) return;

  const person = getPartnerById(personId);
  const messages = getThreads()[personId] || [];
  currentInboxPartnerId = personId;
  markNotificationsForPersonRead(personId);

  if (!person) {
    emptyView.hidden = false;
    threadView.hidden = true;
    return;
  }

  nameEl.textContent = person.name;
  roleEl.textContent = person.role;
  messagesEl.innerHTML = messages.length
    ? messages.map((msg) => `
      <div class="chat-message ${msg.sender === "user" ? "user-message" : "partner-message"}">
        <div class="chat-message-content">${msg.text}</div>
        <small class="chat-message-time">${msg.time}</small>
      </div>
    `).join("")
    : `
      <div class="chat-welcome">
        <h4>No messages for ${person.name} yet</h4>
        <p>Send a message from their profile to start this thread.</p>
      </div>
    `;

  emptyView.hidden = true;
  threadView.hidden = false;
  messagesEl.scrollTop = messagesEl.scrollHeight;
  renderMessagesInbox();
  window.renderNotifications?.();
}

function openMessagesInbox(personId) {
  if (personId) {
    const person = getPartnerById(personId);
    if (person) ensureThread(person);
    currentInboxPartnerId = personId;
  }
  if (typeof setDashboardPage === "function") {
    setDashboardPage("messages");
  }
  renderMessagesInbox();
  if (personId) {
    renderInboxThread(personId);
  }
}

function openRecipientInbox(person) {
  currentRecipientPartner = person;
  ensureThread(person);
  renderRecipientInbox();
  document.getElementById("recipientModalOverlay")?.classList.add("open");
}

function openTeammateChat(person) {
  currentChatPartner = person;
  ensureThread(person);

  document.getElementById("chatPartnername").textContent = person.name;
  document.getElementById("chatPartnerrole").textContent = person.role;
  document.getElementById("chatSafetyNote").textContent = "Type a message and the teammate will send an automated reply for now.";

  renderChatMessages();
  document.getElementById("chatModalOverlay").classList.add("open");
  document.getElementById("chatInput")?.focus();
}

function sendMessage() {
  if (!currentChatPartner) return;

  const input = document.getElementById("chatInput");
  const messageText = String(input?.value || "").trim();
  if (!messageText) return;

  addMessage(currentChatPartner, "user", messageText);
  if (input) input.value = "";
  renderChatMessages();
  renderMessagesInbox();
  scheduleAutoReply(currentChatPartner, messageText);
}

function closeChatModal() {
  document.getElementById("chatModalOverlay")?.classList.remove("open");
  currentChatPartner = null;
}

function closeRecipientModal() {
  document.getElementById("recipientModalOverlay")?.classList.remove("open");
  currentRecipientPartner = null;
}

function initChatModalHandlers() {
  document.getElementById("closeChatModalBtn")?.addEventListener("click", closeChatModal);
  document.getElementById("sendMessageBtn")?.addEventListener("click", sendMessage);
  document.getElementById("chatInput")?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendMessage();
  });
  document.getElementById("chatModalOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "chatModalOverlay") closeChatModal();
  });
  document.getElementById("closeRecipientModalBtn")?.addEventListener("click", closeRecipientModal);
  document.getElementById("recipientModalOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "recipientModalOverlay") closeRecipientModal();
  });
  document.getElementById("messagesInboxList")?.addEventListener("click", (event) => {
    const item = event.target.closest("[data-message-thread]");
    if (!item) return;
    renderInboxThread(item.dataset.messageThread);
  });

  renderMessagesInbox();
}

window.openMessagesInbox = openMessagesInbox;
window.openRecipientInbox = openRecipientInbox;
window.renderMessagesInbox = renderMessagesInbox;
window.renderInboxThread = renderInboxThread;
window.getUnreadMessageCount = getUnreadMessageCount;
window.markAllMessageNotificationsRead = markAllMessageNotificationsRead;
