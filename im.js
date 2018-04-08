var net = require('net');

// var HOST = '127.0.0.1';
var HOST = '192.168.0.102';
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

        var hldata = data.slice(0, 2);
        
        var head_length = hldata.toString();

        var head_json = data.slice(2, parseInt(head_length) + 1);

        console.log(head_json.toString());

        var info = JSON.parse(head_json.toString());

        if (info.msgtype == '-1') {
            var user = {info:info,sock:sock};
            login(user);
            return;
        }

        if (info.msgtype == '11') {
            sendText(data,info);
        }






        // var head_length = data.readInt32BE(0,4);
        
        // data = data.slice(4, data.length);

        // var head_data = data.slice(0, head_length);

        // data = data.slice(head_length, data.length);

        // console.log('head is ' + head_data.toString());

        // var msg_data = data.slice(0, data.length);

        // if (msg_data.length != 0) {
        //     console.log('body is ' + msg_data.toString());
        // }

        // 回发该数据，客户端将收到来自服务端的数据
        // sock.write('You said "' + data + '"');
    });
    // 为这个socket实例添加一个"close"事件处理函数
    sock.on('close', function(data) {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    });
}).listen(PORT, HOST);
console.log('Server listening on ' + HOST + ':' + PORT);
