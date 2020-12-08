var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:50492",
        methods: ["GET", "POST"],
        credentials: true
    }
});
const PORT = process.env.PORT || 5000;

var allClients = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

    console.log("user connected");

    socket.on('disconnecting', function () {
        console.log(socket.rooms);

        for (let roomName of socket.rooms) {
            console.log(roomName);
            io.to(roomName).emit('chat-message', 'user disconnected..', 'system');
        }
    });

    socket.on('disconnect', () => {
        console.log(`user ${socket.id} disconnected`);
    });

    socket.on('chat-message', (sessionId, message, nickname) => {
        console.log('chat-message =>' + sessionId + " - nickname: " + nickname + " - message:" + message)
        io.to(sessionId).emit('chat-message', message, nickname);
    });

    socket.on('movement-done', (sessionId, current, next, movementResult) => {
        console.log('movement-done => current =' + current + ' - next = ' + next);
        io.to(sessionId).emit('movement-done', current, next, movementResult);
    });

    socket.on('join-session', (sessionId, nickname) => {
        console.log(nickname + ' has joined the room ' + sessionId);
        io.to(sessionId).emit('chat-message', '<i>' + nickname + ' has joined the game</i>', 'system');
        socket.join(sessionId);
    });
});

http.listen(PORT, () => {
    console.log(`listening on ${ PORT }`);
});