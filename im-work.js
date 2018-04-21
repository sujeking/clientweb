var net = require('net');
var fs = require('fs');


var HOST = '192.168.200.70';

var PORT = 8080;

var users = [];

var alldata = [];
var bodyLength = 0;
var head_length;
var kdata;
var allLength;

setInterval(function() {
    sendNotice43();
}, 20 * 1000);

setInterval(function() {
    sendNotice41();
}, 10 * 1000);

// ---------------------------------


function hasUser (kuser) {
    var kusers = users.filter(function (user) {
       return user.info.sender == kuser.info.sender;
        });
    if (kusers.length == 0) {
        return false;
    } else {
        return true;
    }
}

function login (user) {
    if (users.length == 0) {
        console.log(user.info.sender + '登录');
        users.push(user);
    } else if (!hasUser(user)){
        console.log(user.info.sender + '登录');
        users.push(user);
    }

    var info = {'code':200,'msg':'login success','msgType':'-1'};
    
    var json = JSON.stringify(info);
    
    var length = json.length;
    
    var bufs = [];

    var lengbf = Buffer.alloc(4);
    
    lengbf.writeUInt32BE(length);

    bufs.push(lengbf);
    
    var headbf = Buffer.from(json);
    
    bufs.push(headbf)

    var msgbf = Buffer.concat(bufs);
    user.sock.write(msgbf);
}


function sendNotice41 () {

    if (users.length == 0) {
        return;
    }
    console.log('定时发送消息 41');
     

    var body = {
    'CSZY': "1",  
    'CHZBM': "hz0001",  
    'ILRLX': 2,    
    'DTJSJ': "2017-12-21 10:30:54",   
    'CXL': "1",         
    'ICLZT': 1,        
    'CSSY': "1",       
    'DCLSJ': "2017-12-21 10:30:52",    
    'CBM': "3"          
    };

    var bodyjson = JSON.stringify(body);
    var bodybf = Buffer.from(bodyjson);

    var info = {'msgType':'41'};
    info.bodyLength = bodybf.length;
    
    var json = JSON.stringify(info);
    
    var length = json.length;
    
    var bufs = [];

    var lengbf = Buffer.alloc(4);
    
    lengbf.writeUInt32BE(length);

    var headbf = Buffer.from(json);
    
    bufs.push(lengbf);
    bufs.push(headbf)
    bufs.push(bodybf);


    /// 组装完整的buffer
    var msgbf = Buffer.concat(bufs);

    console.log(bufs.toString());

    users[0].sock.write(msgbf);
}

function sendNotice43 () {

    if (users.length == 0) {
        return;
    }
    console.log('定时发送消息 43');
     
    var info = {'msgType':'43'};
    
    var json = JSON.stringify(info);
    
    var length = json.length;
    
    var bufs = [];

    var lengbf = Buffer.alloc(4);
    
    lengbf.writeUInt32BE(length);

    bufs.push(lengbf);
    
    var headbf = Buffer.from(json);
    
    bufs.push(headbf)

    var msgbf = Buffer.concat(bufs);

    console.log(bufs.toString());

    users[0].sock.write(msgbf);
}

function sendText(data,info,sock) {

    var kusers = users.filter(function (user) {
        return user.info.sender == info.receiver;
    });
    if (kusers.length == 0) {
        return;
    }
    try {
        kusers[0].sock.write(data,function() {
            console.log('发送数据成功');
            alldata.splice(0,alldata.length);
            console.log(alldata);
        });
    } catch (err) {
        console.log('error ==============' + err);
    }
}

function head_info (data) {
    head_length = data.readInt32BE(0,4);

    data = data.slice(4);
    
    var head_json = (data.slice(0,head_length)).toString();
    
    // console.log('head is +++++++++++++++++++' + head_json);
    
    data = data.slice(head_length);
    
    var info = JSON.parse(head_json);
    
    bodyLength = info.bodyLength;

    allLength = 4 + head_length + bodyLength;

    var msg = data.slice(0,data.length);

    if (msg.length < bodyLength) {
        alldata.push(kdata);
        return null;
    } else {
        return {info,msg};
    }
}



net.createServer(function(sock) {
    sock.on('error',function (data) {
        console.log('发生错误' + data);
    });

    sock.on('end',function (data) {
        console.log('====================END===============================');
    });

    sock.on('data', function(data) {
        console.log('开始');
        if (alldata.length != 0) {
            alldata.push(data)
            var file = Buffer.concat(alldata);
            console.log('allLength ===========>' + allLength);
            console.log('now length ===========>' + file.length);

            if (file.length == allLength) {            
                data = file;
            } else {
                return;
            }
        }

        kdata = data;
        var obj = head_info(data);
        
        if (obj == null) {
            return;
        }

        if (obj.info.msgType == '-1') {
            var user = {info:obj.info,sock:sock};
            login(user);
            alldata.splice(0,alldata.length);
            return;
        }


        if (obj.info.msgType == '11') {            
            console.log('准备发送文字');
            sendText(kdata,obj.info,sock);
            return;
        }

        if (obj.info.msgType == '21') {
            console.log('准备发送图片');
            sendText(kdata,obj.info,sock);
            return;
            // fs.writeFile('/Users/cdct/Desktop/'+ obj.info.fileName +'.png',obj.msg,function(err) {
            //     if (err) {
            //         throw  err;
            //     };
            //     console.log('/Users/cdct/Desktop/'+ obj.info.fileName +'.png' +'保存文件成功');
            //     alldata.splice(0,alldata.length);
            //     console.log(alldata);
            // });
        }
        if (obj.info.msgType == '22') {    
            console.log('准备发送语音');
            sendText(kdata,obj.info,sock);
            return;
            // fs.writeFile('/Users/cdct/Desktop/'+ obj.info.fileName +'.wav',obj.msg,function(err) {
            //     if (err) {
            //         throw  err;
            //     };
            //     console.log('/Users/cdct/Desktop/'+ obj.info.fileName +'.wav' +'保存文件成功');
            //     alldata.splice(0,alldata.length);
            //     console.log(alldata);
            // });
        }  
        if (obj.info.msgType == '31') {    
            console.log('准备发送JSON');
            sendText(kdata,obj.info,sock);
            return;
        }


    });

    sock.on('close', function(data) {
        console.log(data.toString());
        var index = -1;
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (user.sock == sock) {
                console.log(user.info.sender + '退出');
                index = i;
                alldata.splice(0,alldata.length);
                break;
            }
        }
        users.splice(index,1);
        console.log('online ==============>' + users.length);
    });
}).listen(PORT, HOST);
console.log('Server listening on ' + HOST + ':' + PORT);
