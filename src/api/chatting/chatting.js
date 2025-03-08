import axios from 'axios';
export const chattingAPI = {
    async getChattingMessages(chattingroom_id) {
        const response = axios.get(`/chat/room/${chattingroom_id}/messages`);

        console.log(response);
    }
};
