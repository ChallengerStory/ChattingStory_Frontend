<template>
    <div class="chat-container">
        <div class="connection-controls">
            <button @click="connect" :disabled="isConnected">연결</button>
            <button @click="disconnect" :disabled="!isConnected">연결 해제</button>
            <span v-if="isConnected" class="status-connected">연결됨</span>
            <span v-else class="status-disconnected">연결 안됨</span>
        </div>

        <div class="message-container" ref="messageContainer">
            <div v-for="(message, index) in messages" :key="index" class="message">
                <span class="sender">{{ message.senderId }}:</span>
                <span class="content">{{ message.content }}</span>
            </div>
        </div>

        <div class="input-container">
            <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="메시지 입력..." :disabled="!isConnected" />
            <button @click="sendMessage" :disabled="!isConnected">전송</button>
        </div>
    </div>
</template>

<script setup>
import * as StompJS from '@stomp/stompjs';
import { onBeforeUnmount, ref } from 'vue';
// 반응형 상태 정의
const messages = ref([]);
const newMessage = ref('');
const messageContainer = ref(null);
const isConnected = ref(false);

// 고정값
const roomId = '67c581e1473928720b59294f';
const userId = '1';

const stompClient = new StompJS.Client({
    brokerURL: `ws://localhost:5000/ws`
});
// 연결 성공 콜백
stompClient.onConnect = (frame) => {
    console.log('Connected: ' + frame);
    isConnected.value = true;

    // 메시지 구독
    stompClient.subscribe(`/topic/room/${roomId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        messages.value.push(receivedMessage);
        scrollToBottom();
    });
};

// WebSocket 에러 콜백
stompClient.onWebSocketError = (error) => {
    console.error('Error with websocket', error);
    isConnected.value = false;
};

// STOMP 에러 콜백
stompClient.onStompError = (frame) => {
    console.error('Broker reported error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
    isConnected.value = false;
};
// Add connection failure callback
stompClient.onWebSocketClose = (closeEvent) => {
    console.log('WebSocket connection closed:', closeEvent);
    isConnected.value = false;
};

// Add reconnect logic
stompClient.beforeConnect = () => {
    console.log('Attempting to connect...');
};
// 연결
const connect = () => {
    stompClient.activate();
};

// 연결 해제
const disconnect = () => {
    stompClient.deactivate();
    isConnected.value = false;
    console.log('Disconnected');
};

// 메시지 전송
const sendMessage = () => {
    if (!newMessage.value.trim() || !isConnected.value) return;

    stompClient.publish({
        destination: '/app/send-message',
        body: JSON.stringify({
            roomId: roomId,
            senderId: userId,
            content: newMessage.value,
            timestamp: new Date().toISOString()
        })
    });

    newMessage.value = '';
};

// 스크롤 아래로
const scrollToBottom = () => {
    setTimeout(() => {
        if (messageContainer.value) {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
        }
    }, 50);
};

// 컴포넌트 언마운트 시 연결 해제
onBeforeUnmount(() => {
    if (isConnected.value) {
        disconnect();
    }
});
</script>

<style scoped>
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.connection-controls {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ddd;
}

.connection-controls button {
    margin-right: 10px;
    padding: 5px 10px;
}

.status-connected {
    color: green;
    margin-left: 10px;
}

.status-disconnected {
    color: red;
    margin-left: 10px;
}

.message-container {
    flex: 1;
    padding: 10px;
    overflow-y: auto;
    background-color: #f9f9f9;
}

.message {
    margin-bottom: 10px;
    padding: 8px;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sender {
    font-weight: bold;
    margin-right: 5px;
}

.input-container {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ddd;
    background-color: white;
}

input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 8px;
}

button {
    padding: 8px 16px;
    background-color: #4c7dff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}
</style>
