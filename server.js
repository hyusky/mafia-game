// 1. 필요한 부품(모듈) 가져오기
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// 2. 서버 기본 설정
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 3. 'public' 폴더에 있는 파일들을 웹사이트처럼 제공
app.use(express.static('public'));

// 4. 유저가 우리 웹사이트에 접속했을 때 기본 HTML 파일 보여주기
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 5. 실시간 통신(Socket.IO) 로직
io.on('connection', (socket) => {
  console.log('새로운 유저가 접속했습니다.');

  // 'joinRoom' 이벤트 처리 (유저가 방에 입장할 때)
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room); // 유저를 특정 방(room)에 입장시킴

    // 방에 입장한 유저 본인에게 환영 메시지 전송
    socket.emit('message', {
      user: '관리자',
      text: `${username}님, ${room} 방에 오신 것을 환영합니다!`
    });

    // 본인을 제외한 방 안의 모든 유저에게 입장 알림 전송
    socket.broadcast.to(room).emit('message', {
      user: '관리자',
      text: `${username}님이 입장하셨습니다.`
    });
  });

  // 'chatMessage' 이벤트 처리 (유저가 채팅 메시지를 보낼 때)
  socket.on('chatMessage', ({ room, message }) => {
    // 메시지를 보낸 유저의 닉네임 찾기 (간단한 예시)
    // (원래는 socket에 유저 정보를 저장해두는 것이 좋습니다)
    const user = socket.username || '익명'; 

    // 방 안의 모든 유저에게 채팅 메시지 전송
    io.to(room).emit('message', {
      user: user, // 실제로는 joinRoom할 때 받은 username을 저장했다 써야 함
      text: message
    });
  });

  // 'setUsername' 이벤트 처리 (닉네임 설정)
  socket.on('setUsername', (username) => {
    socket.username = username; // 소켓 세션에 닉네임 저장
  });

  // 접속 종료 처리
  socket.on('disconnect', () => {
    console.log('유저가 접속을 종료했습니다.');
    // (여기서 방에서 나갔다는 알림을 io.to(room).emit으로 보내주면 더 좋습니다)
  });
});

// 6. 서버 실행
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});