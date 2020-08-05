const socket = io("/");
// store the joined users info
const peers = {};
//----------------------------------------------------------

const videoGrid = document.getElementById("video-grid");

const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement("video");
myVideo.muted = true;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    // someone tried to call the room 
    myPeer.on("call", call => {
      call.answer(stream);
      // new user get the current video streams
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    });

    // user connected event 
    socket.on("user-connected", userId => {
      // if new user joined our room send the current stream to the new user 
      connectToNewUser(userId, stream);
    });
  });

  // user leaves the room or disconnected
socket.on("user-disconnected", (userId) => {
  console.log(userId);
  if (peers[userId]) {
    peers[userId].close();
  }
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("User connected", userId);
});
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  // store user info who joined the room
  peers[userId] = call;
}