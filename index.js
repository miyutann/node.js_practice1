const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;

const mongoose = require("mongoose");
mongoose.connect(MONGODB_URL, { useNewUrlParser: true }); // データベースに接続する

// オプション設定
const options = {
  timestamps: true, // データの作成時刻・更新時刻を記録する
  toJSON: { // データを JSON にする際の設定
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => { delete ret._id; return ret; }
  } 
}; 

// 保存するデータの形を定義する（データの種類が複数ある場合はそれぞれ１つずつ定義する）
const postSchema = new mongoose.Schema({ name: String, msg: String }, options);
 // その形式のデータを保存・読み出しするために必要なモデルを作る
const Post = mongoose.model("Post", postSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('login', (name) => {
    io.emit('login', name);

    socket.on('logout',()=> {
      io.emit('logout',name);
    });

    socket.on('chat message', (msg) => {
      io.emit('chat message', { name, msg });
    //io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets
    });

    socket.on('typing', () => {
      console.log('typing')
      io.emit('typing', name);
    })

    socket.on('disconnect', () => {
      io.emit('logout',name); // ログイン中のユーザーが切断した場合、ログアウトイベントを送信
      console.log('user disconnected');
    });
  })    
});

server.listen(port, () => {
  console.log('listening on port:' + port);
});