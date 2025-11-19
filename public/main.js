// 서버와 연결
const socket = io();

// HTML 요소들 가져오기
const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username-input');
const roomInput = document.getElementById('room-input');
const roomTitle = document.getElementById('room-title');

const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const chatMessages = document.getElementById('chat-messages');

let currentUsername = '';
let currentRoom = '';

// [입장하기] 폼 제출 시
joinForm.addEventListener('submit', (e) => {
    e.preventDefault(); // 폼 기본 동작(새로고침) 방지

    currentUsername = usernameInput.value;
    currentRoom = roomInput.value;

    if (currentUsername && currentRoom) {
        // 1. 서버에 닉네임 전송
        socket.emit('setUsername', currentUsername);
        // 2. 서버에 방 입장 요청
        socket.emit('joinRoom', { username: currentUsername, room: currentRoom });

        // 3. 화면 전환
        joinScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        roomTitle.innerText = `[${currentRoom}] 대기방`;
    }
});

// [채팅] 폼 제출 시
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = msgInput.value;
    if (message) {
        // 서버에 채팅 메시지 전송
        socket.emit('chatMessage', { room: currentRoom, message: message });
        msgInput.value = ''; // 입력창 비우기
    }
});

// 서버로부터 'message' 이벤트를 받았을 때
socket.on('message', (data) => {
    // data = { user: '...', text: '...' }
    addMessage(data);
});

// 채팅창에 메시지 추가하는 함수
function addMessage(data) {
    const div = document.createElement('div');
    div.classList.add('message');

    if (data.user === '관리자') {
        div.classList.add('admin-msg');
        div.innerHTML = `<p>${data.text}</p>`;
    } else {
        // 내가 보낸 메시지인지 확인
        const isMe = data.user === currentUsername;
        div.classList.add(isMe ? 'my-msg' : 'other-msg');
        div.innerHTML = `<p><strong>${data.user}</strong>: ${data.text}</p>`;
    }

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight; // 항상 맨 아래로 스크롤
}