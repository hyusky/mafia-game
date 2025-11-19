// 서버와 연결
const socket = io();

// HTML 요소들 가져오기
const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username-input');
// const roomInput = document.getElementById('room-input'); // 방 입력창이 없으니 삭제

const roomTitle = document.getElementById('room-title');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const chatMessages = document.getElementById('chat-messages');

let currentUsername = '';
// 모든 유저가 접속할 고정된 방 이름
const currentRoom = 'global_lobby'; 

// [입장하기] 폼 제출 시
joinForm.addEventListener('submit', (e) => {
    e.preventDefault(); // 폼 기본 동작(새로고침) 방지

    currentUsername = usernameInput.value;
    // currentRoom = roomInput.value; // 방 입력창에서 값을 가져올 필요 없음

    // 닉네임만 입력받으면 바로 실행
    if (currentUsername) {
        // 1. 서버에 닉네임 전송
        socket.emit('setUsername', currentUsername);
        // 2. 서버에 방 입장 요청 (방 이름은 'global_lobby'로 고정)
        socket.emit('joinRoom', { username: currentUsername, room: currentRoom });

        // 3. 화면 전환
        joinScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        // 방 제목도 고정된 값으로 변경
        roomTitle.innerText = `마피아 공용 대기방`; 
    }
});

// [채팅] 폼 제출 시
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = msgInput.value;
    if (message) {
        // 서버에 채팅 메시지 전송 (방 이름은 'global_lobby'로 고정)
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