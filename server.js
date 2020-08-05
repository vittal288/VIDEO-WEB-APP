const express = require("express");
const e = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const { Socket } = require("net");
//-------------------------------------------------------

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", {
    roomId: req.params.room,
  });
});

io.on('connection', socket=>{
    socket.on('join-room', (roomId, userId)=>{
        // console.log(roomId, userId);
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);

        // emit events once user disconnected 
        socket.on('disconnect',()=>{
          socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });
    });
});
// UI port : http://localhost:3000
server.listen(3000);
