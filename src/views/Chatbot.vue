<template>
  <div class="chatbot-popup-wrapper">
    <!-- Chat Icon Button -->
    <div 
      class="chat-icon-btn"
      @click="toggleChatbot"
      :class="{ active: isOpen }"
    >
      <svg v-if="!isOpen" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 119.35"><title>chatbot</title><path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </div>

    <!-- Popup Chat Window -->
    <transition name="chat-popup">
      <div v-if="isOpen" class="chat-popup">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-content">
            <div class="bot-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="5" r="2"/>
                <path d="M12 7v4"/>
                <line x1="8" y1="16" x2="8" y2="16"/>
                <line x1="16" y1="16" x2="16" y2="16"/>
              </svg>
            </div>
            <div class="bot-info">
              <h4>AI Assistant</h4>
              <span class="status">Hoạt động</span>
            </div>
          </div>
          <button @click="toggleChatbot" class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', msg.from]"
          >
            <div class="message-bubble" v-html="msg.text"></div>
          </div>

          <!-- Streaming reply -->
          <div v-if="streamingReply" class="message bot typing">
            <div
              class="message-bubble"
              v-html="streamingReply + '<span class=cursor>|</span>'"
            ></div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-container">
          <form @submit.prevent="sendMessage" class="input-form">
            <input
              v-model="input"
              type="text"
              placeholder="Nhập tin nhắn..."
              autocomplete="off"
              :disabled="isStreaming"
              class="message-input"
            />
            <button
              v-if="isStreaming"
              type="button"
              @click="stopStreaming"
              class="stop-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="6" width="12" height="12"/>
              </svg>
            </button>
            <button
              v-else
              type="submit"
              :disabled="!input.trim()"
              class="send-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22,2 15,22 11,13 2,9 22,2"/>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick, inject } from "vue";

const URL_API = inject("URL_API");

const isOpen = ref(false);
const input = ref("");
const messages = ref([{ from: "bot", text: "Chào bạn! Tôi có thể giúp gì cho bạn?" }]);
const messagesContainer = ref(null);

const streamingReply = ref("");
const isStreaming = ref(false);

function toggleChatbot() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    scrollToBottom();
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function addMessage(from, text) {
  messages.value.push({ from, text });
  scrollToBottom();
}

let eventSource = null;

function stopStreaming() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    isStreaming.value = false;
    if (streamingReply.value) {
      addMessage("bot", streamingReply.value + "...");
      streamingReply.value = "";
    }
  }
}

async function sendMessage() {
  if (!input.value.trim()) return;

  const userMessage = input.value.trim();
  addMessage("user", userMessage);
  input.value = "";

  // Ngắt kết nối nếu đang tồn tại SSE
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }

  streamingReply.value = "";
  isStreaming.value = true;

  const url = new URL(`${URL_API}/api/chatbot`);
  url.searchParams.append("message", userMessage);

  eventSource = new EventSource(url.toString());

  eventSource.onmessage = (event) => {
    if (event.data === "[DONE]") {
      addMessage("bot", streamingReply.value);
      streamingReply.value = "";
      isStreaming.value = false;
      eventSource.close();
      eventSource = null;
      return;
    }
    streamingReply.value += event.data;
    scrollToBottom();
  };

  eventSource.onerror = (err) => {
    console.error("EventSource lỗi:", err);

    if (streamingReply.value) {
      addMessage("bot", streamingReply.value + "...");
      streamingReply.value = "";
    }

    addMessage("bot", "❌ Lỗi kết nối đến chatbot. Vui lòng thử lại sau.");

    isStreaming.value = false;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
</script>

<style scoped>
.chatbot-popup-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-icon-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 10px;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.chat-icon-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

.chat-icon-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  transform: rotate(180deg);
}

.chat-popup {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 380px;
  height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bot-avatar {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bot-info h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.bot-info .status {
  white-space: nowrap;
  font-size: 12px;
  opacity: 0.8;
}
.status {
  position: relative;
  color: #4ade80;
}

.status::before {
  content: '';
  position: absolute;
  left: -1em;
  top: 120%;
  transform: translateY(-50%);
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: currentColor;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.bot {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot .message-bubble {
  background: #f3f4f6;
  color: #374151;
  border-bottom-left-radius: 4px;
}

.message.bot.typing .message-bubble {
  background: #e5e7eb;
}

.cursor {
  animation: blink 1s infinite;
  color: #667eea;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.input-container {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
}

.input-form {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.message-input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
}

.send-btn, .stop-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.stop-btn {
  background: #ef4444;
  color: white;
}

.stop-btn:hover {
  background: #dc2626;
  transform: scale(1.05);
}

/* Animations */
.chat-popup-enter-active, .chat-popup-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-popup-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.chat-popup-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

/* Scrollbar */
.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Responsive */
@media (max-width: 480px) {
  .chat-popup {
    width: 320px;
    height: 450px;
  }
  
  .chatbot-popup-wrapper {
    bottom: 15px;
    right: 15px;
  }
}
</style>