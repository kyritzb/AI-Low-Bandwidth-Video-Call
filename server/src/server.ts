import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import colors from "colors";
//Local Imports
import RoomManagement from "./src/RoomManagement";
import User from "./models/User";

dotenv.config();
const roomManagement = new RoomManagement();
//======================================================================================================
//										Configure Express server										   |
//======================================================================================================
const PORT = process.env.PORT || 8000;
const app = express();
app.use(cors());
app.use(express.json());
const server = require("http").createServer(app);
let io;
if (process.env.NODE_ENV === "development") {
  io = require("socket.io")(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });
} else {
  io = require("socket.io")(server);
}

server.listen(PORT);

console.log("---------------------------------");
console.log("|  P2P Microservice is running  |");
console.log("---------------------------------");
console.log("Environment: ", process.env.NODE_ENV);
console.log("Running on port:", PORT);

//======================================================================================================
//											Api Endpoints											   |
//======================================================================================================
import p2pRoute from "./routes/p2p";
app.use("/p2p", p2pRoute);

app.get("/", function (req, res) {
  res.send("Successfully hit the P2P api!");
});

//======================================================================================================
//											socket io										   |
//======================================================================================================

io.on("connection", (socket: any) => {
  console.log("a user connected with id", socket.id);
  let establishConnection = (user1: User, user2: User) => {
    console.log(
      "establishing a connection between ",
      user1.socketId,
      user2.socketId
    );
    socket
      .to(user1.socketId)
      .emit("create_new_connection", { socketId: user2.socketId });
  };

  interface join_room_payload {
    roomName: string;
    peerName: string;
  }

  socket.on("join_room", (payload: join_room_payload) => {
    var { roomName, peerName } = payload;
    socket.join(roomName);

    //sets the name of the peer for users in the room an future users in the room
    roomManagement.setName(peerName, socket.id);

    socket.to(roomName).emit("peer_set_name", {
      name: peerName,
      socketId: socket.id,
    });

    roomManagement.createOrJoinRoom(roomName, socket.id);

    let users = roomManagement.getUsersInRoom(roomName);

    if (users != null || users != undefined) {
      if (users.length < 5) {
        let userB = roomManagement.getUserBySocketId(socket.id);
        if (userB != null) {
          for (let i = 0; i < users.length; i++) {
            if (users[i].socketId !== socket.id) {
              let userA = users[i];
              establishConnection(userA, userB);
            }
          }
        }
      }
      let usersInRoom = users.filter((user: User) => {
        return user.socketId !== socket.id;
      });
      let screensharingPeers = roomManagement.getRoomBySocketId(socket.id)
        ?.screenshare;
      if (screensharingPeers === null || screensharingPeers === undefined) {
        screensharingPeers = [];
      }
      socket.emit("connected_to_room", {
        isConnected: true,
        peers: usersInRoom,
        screenshare: screensharingPeers,
      });
    }
  });

  interface send_local_offer_payload {
    socketId: String;
    offer: Object;
  }

  socket.on("send_local_offer", (payload: send_local_offer_payload) => {
    var { socketId, offer } = payload;
    console.log("sending local offer to ", socketId, "from", socket.id);
    socket
      .to(socketId)
      .emit("got_remote_offer", { offer: offer, socketId: socket.id });
  });

  interface start_screen_share_payload {
    streamId: String;
  }

  socket.on("start_screen_share", (payload: start_screen_share_payload) => {
    var { streamId } = payload;
    var roomName = roomManagement.getRoomNameBySocketId(socket.id);
    roomManagement.startScreenShare(roomName, streamId);
    socket.to(roomName).emit("peer_start_screen_share", {
      streamId: streamId,
    });
  });

  interface stop_screen_share_payload {
    streamId: String;
  }

  socket.on("stop_screen_share", (payload: stop_screen_share_payload) => {
    var { streamId } = payload;
    var roomName = roomManagement.getRoomNameBySocketId(socket.id);
    roomManagement.stopScreenShare(roomName, streamId);
    socket.to(roomName).emit("peer_stop_screen_share", {
      streamId: streamId,
    });
  });

  interface send_local_answer_payload {
    socketId: String;
    answer: Object;
  }

  socket.on("send_local_answer", (payload: send_local_answer_payload) => {
    var { socketId, answer } = payload;
    socket
      .to(socketId)
      .emit("got_remote_answer", { answer: answer, socketId: socket.id });
  });

  interface send_ice_candidate_payload {
    candidate: Object;
    socketId: String;
  }

  socket.on("send_ice_candidate", (payload: send_ice_candidate_payload) => {
    var { candidate, socketId } = payload;
    socket
      .to(socketId)
      .emit("got_ice_candidate", { candidate: candidate, socketId: socket.id });
  });

  interface set_name_payload {
    name: String;
  }

  socket.on("set_name", (payload: set_name_payload) => {
    var { name } = payload;
    roomManagement.setName(name, socket.id);
    var roomName = roomManagement.getRoomNameBySocketId(socket.id);
    socket.to(roomName).emit("peer_set_name", {
      name: name,
      socketId: socket.id,
    });
  });

  socket.on("leave_room", () => {
    var roomName = roomManagement.getRoomNameBySocketId(socket.id);
    socket.to(roomName).emit("peer_left_room", {
      socketId: socket.id,
    });
    console.log("user disconnected");
    roomManagement.leaveRoom(socket.id);
  });

  socket.on("disconnect", () => {
    var roomName = roomManagement.getRoomNameBySocketId(socket.id);
    socket.to(roomName).emit("peer_left_room", {
      socketId: socket.id,
    });
    console.log("user disconnected");
    roomManagement.leaveRoom(socket.id);
  });
});
