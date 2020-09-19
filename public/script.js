const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = false;
let myVideoStream;
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443", //from 3030 for the deployment and changed to 443
});

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mediaDevices.getUserMedia ||
  navigator.mozGetUserMedia;

getUserMedia({ video: true, audio: true }, function (stream) {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);
  socket.on("user-connected", (userId) => {
    connectToNewUser(userId, stream);
  });
});
peer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      myVideoStream = stream;
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
        // Show stream in some video/canvas element.
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  console.log("calling...");
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

let text = $("input");

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit("message", text.val());
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  $(".messages  ").append(
    `<li class="message"><b>user</b><br/>${message}</li>`
  );
  scrollToBottom();
});

const scrollToBottom = () => {
  var d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;

    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setMuteButton = () => {
  const html = `
    <i class="mute fas fa-microphone"> </i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute__button").innerHTML = html;
};
const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"> </i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute__button").innerHTML = html;
};
const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
};

const setPlayVideo = () => {
  const html = `
    <i class="stop fas fa-video-slash"> </i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video__button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"> </i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video__button").innerHTML = html;
};
