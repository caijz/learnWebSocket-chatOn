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

chat.changeRoom = function (socket) {
    var self = this;
    socket.on('change room', function (msg) {
        var sysMsg = self.userName[socket.id] + ' left room ' + self.currentRoom[socket.id];
        self.io.to(self.currentRoom[socket.id]).emit('sys message', sysMsg);
        socket.leave(self.currentRoom[socket.id], function () {
            socket.join(msg);
            self.currentRoom[socket.id] = msg;
            sysMsg = self.userName[socket.id] + ' join room ' + self.currentRoom[socket.id];
            socket.emit('sys message', sysMsg);
            socket.emit('change room name', msg);
        });
    });
};

chat.sysMsg = function (socket) {
    var self = this;
    socket.on('sys message', function (msg) {
        self.io.to(self.currentRoom[socket.id]).emit('chat message', msg)
    })
};

chat.userMsg = function (socket) {
    var self = this;
    socket.on('chat message', function (msg) {
        msg = self.userName[socket.id] + ' said: ' + msg;
        self.io.to(self.currentRoom[socket.id]).emit('chat message', msg);
    });
};

chat.assignGuestName = function (socket) {
    this.userName[socket.id] = 'Guest' + this.userName;
    this.usedName.push('Guest' + this.userName);
    this.userName++;

    var msg = this.userName[socket.id] + ' enter the room! Welcome!';
    this.io.emit('new user', msg);
};

chat.changeName = function (socket) {
    var self = this;
    socket.on('change name', function (msg) {
        if(self.usedName.indexOf(msg) == -1) {
            var nameIndex = self.usedName.indexOf(self.userName[socket.id]);
            self.userName[socket.id] = msg;
            self.usedName[nameIndex] = msg;
            socket.emit('sys message', 'Your name has been changed as ' + msg);
        } else {
            socket.emit('sys message', 'Your name has been used');
        }
    })
};

module.exports = chat;
