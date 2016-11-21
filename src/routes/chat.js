var express = require('express');
var app = express();
var socketIo = require('socket.io');

var chat = {};

chat.io = false;
chat.userName = {};
chat.usedName = {};
chat.userNum = 0;
chat.currentRoom = {};

chat.initialize = function (http) {
    this.io = socketIo(http);
    this.ioListen();
};

chat.ioListen = function () {
  var self = this;
    this.io.on('connection', function (socket) {
        self.assignRoom(socket);
        self.changeRoom(socket);
        self.sysMsg(socket);
        self.userMsg(socket);
        self.assignGuestName(socket);
        self.changeName(socket);
        self.disconnect(socket);
    });
};

chat.assignRoom = function (socket) {
    var self = this;
    socket.join('Lobby', function () {
        self.currentRoom[socket.id] = 'Lobby';
    });
};

