// we need to pass the server path , i.e set up to / 
// socket will connect to root path i.e /
const socket = io('/');
// store the joined users info
const peers = {};
//----------------------------------------------------------

const videoGrid = document.getElementById("video-grid");

// send our server information to the peerJS()
// after doing this now, we have connections between the peerjs which is running on 3001 port 
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement("video");
// mute ourselves 
myVideo.muted = true;
// trying to connect our video 
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
}).then((stream) => {
    addVideoStream(myVideo, stream);
    // if someone tries to call 
    // someone tried to call the room 
    myPeer.on("call", call => {
      call.answer(stream);
      // new user get the current video streams
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      })
    });

    // if user is connecting to existing room and with on going stream 
    // user connected event 
    socket.on("user-connected", userId => {
      // if new user joined our room send the current stream to the new user 
      connectToNewUser(userId, stream);
    });
});

// user leaves the room or disconnected
socket.on("user-disconnected", (userId) => {
  console.log(userId+' user is disconnected or left');
  if (peers[userId]) {
    peers[userId].close();
  }
});



// as soon we connect peer server and pass the id to server 
myPeer.on("open", id => {
  // it will emit an event to server 
  // ROOM_ID is the id which was emitted from server and was captured in view room.ejs code 
  socket.emit("join-room", ROOM_ID, id);
});


// listen the event which is emitted from server 
socket.on("user-connected", (userId) => {
  console.log("User connected", userId);
});


function addVideoStream(video, stream) {
  // stream is playing video data 
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    // once video is loaded on the page , as soon we get the data and then play it
    video.play();
  });

  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  // call method will call to the user, which is provided as userId
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  // while calling , send the current vide stream 
  // userVideoStream : this is the stream which other user is calling 
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  // if some leaves the call or disconnected the call , then remove that video from current room
  call.on("close", () => {
    video.remove();
  });

  // store user info who joined the room
  peers[userId] = call;
}