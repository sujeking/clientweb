var net = require('net');

var HOST = '192.168.200.70';

var PORT = 8080;

var users = [];

function login (user) {
    users.push(user);
    user.sock.write('login success' + user.info.sender);
}

function sendText(data,info) {
    var kusers = users.filter(function (user) {
        return user.info.sender == info.receiver;
    });
    kusers[0].sock.write(data);
}

function sendFile() {
    
}

function sendURI () {
    
}

function exit () {
    
}

net.createServer(function(sock) {

    sock.on('data', function(data) {
        var kdata = data;

        var head_length = data.readInt32BE(0,4);

        data = data.slice(4);

        var head_json = (data.slice(0,head_length)).toString();

        data = data.slice(head_length);

        var msg = (data.slice(0,data.length)).toString();

        var info = JSON.parse(head_json);

        if (info.msgType == '-1') {
            
            var user = {info:info,sock:sock};

            login(user);
            
            return;
        }

        if (info.msgType == '11') {
            
            sendText(kdata,info);
            
            return;
        }
    });

    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
}).listen(PORT, HOST);
console.log('Server listening on ' + HOST + ':' + PORT);
