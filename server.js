const express = require("express");
const app = express();
const server = require("http").Server(app);
// socket io will get to which server to communicate 
const io = require("socket.io")(server);
// generate dynamic room ids on press enter on the browser URL 
const { v4: uuidv4 } = require("uuid");

//-------------------------------------------------------

// for view engine, you can use it here any view engine 
app.set("view engine", "ejs");
app.use(express.static("public"));

// set the home page if required, currently we dont have here 
app.get("/", (req, res) => {
  // generate dynamic room ids
  res.redirect(`/${uuidv4()}`);
});

// handle dynamic room id 
app.get("/:room", (req, res) => {
  // room is view name i.e (room.ejs)
  res.render("room", {
    roomId: req.params.room,
  });
});


// any time if someone connect to our web page 
// through socket user connection happens 
io.on('connection', socket=>{
  // if some connects to our room
  // join-room is event 
    socket.on('join-room', (roomId, userId)=>{
        socket.join(roomId);
        // send a message to the room (using broadcast, will send a message to everyone inside room)
        socket.to(roomId).broadcast.emit('user-connected', userId);

        // emit events once user disconnected 
        socket.on('disconnect',()=>{
          socket.to(roomId).broadcast.emit('user-disconnected', userId);
        });
    });
});

// start the server with port 3000
// the video stream which just transfer to network data not with this server 
// server is used just for ROOM 
// UI port : http://localhost:3000
server.listen(3000);



// NOTE: PEERJS will helps us : they expose method to connections between the users using webRTC