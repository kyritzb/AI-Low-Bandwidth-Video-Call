import { timeStamp } from "console";
import Room from "../models/Room";
import User from "../models/User";

var rooms = new Map();

export default class RoomManagement {
  public static rooms: Map<String, Room> = new Map(); //allows the rooms variable to be the same for every instance of this object

  constructor() {}

  get getRooms() {
    return RoomManagement.rooms;
  }

  createOrJoinRoom(roomName: String, socketId: String) {
    // if the user does not exists in a room
    var newUser = new User(socketId);

    if (RoomManagement.rooms.has(roomName)) {
      //join room
      let room = RoomManagement.rooms.get(roomName);
      room?.addUser(newUser);
      console.log("joined room");
    } else {
      //create room
      console.log("creating room");
      var newRoom = new Room(roomName);
      newUser.setIsHost = true;
      newRoom?.addUser(newUser);
      RoomManagement.rooms.set(roomName, newRoom);
    }
    console.log(RoomManagement.rooms);
  }

  startScreenShare(roomName: String, streamId: String) {
    var room = RoomManagement.rooms.get(roomName);
    if (room != null || room != undefined) {
      room.screenshare.push(streamId);
      console.log("started screensharing in:", room);
    }
  }

  stopScreenShare(roomName: String, streamId: String) {
    var room = RoomManagement.rooms.get(roomName);
    if (room != null || room != undefined) {
      let index = room.screenshare.indexOf(streamId);
      room.screenshare.splice(index, 1);
      console.log("stopped screensharing in:", room);
    }
  }

  leaveRoom(socketId: String) {
    var roomName = this.getRoomNameBySocketId(socketId);
    if (RoomManagement.rooms.has(roomName)) {
      var room = RoomManagement.rooms.get(roomName);
      if (room != null || room != undefined) {
        room.removeUser(socketId);
        if (room.users.length === 0) {
          //if the room is empty delete it
          console.log("closed room: " + roomName);
          rooms.delete(roomName);
        }
        console.log(rooms);
      }
    }
  }

  getUsersInRoom(roomName: String): Array<User> | null {
    let room = RoomManagement.rooms.get(roomName);
    if (room != null || room != undefined) {
      let users = room.getUsers;
      if (users != null || users != undefined) {
        return users;
      }
    }
    return null;
  }

  getUserBySocketId(socketId: String): User | null {
    let rooms = RoomManagement.rooms;
    let user = null;
    rooms.forEach((room) => {
      for (var i = 0; i < room.users.length; i++) {
        if (room.users[i].socketId === socketId) {
          user = room.users[i];
        }
      }
    });
    return user;
  }

  getRoomNameBySocketId(socketId: String): String {
    let rooms = RoomManagement.rooms;
    let roomName: String = "";
    rooms.forEach((room) => {
      for (var i = 0; i < room.users.length; i++) {
        if (room.users[i].socketId === socketId) {
          roomName = room.name;
        }
      }
    });
    return roomName; //if the roomname is not found then returns nothing
  }

  getRoomBySocketId(socketId: String): Room | null {
    let rooms = RoomManagement.rooms;
    let selectedRoom = null;
    rooms.forEach((room) => {
      for (var i = 0; i < room.users.length; i++) {
        if (room.users[i].socketId === socketId) {
          selectedRoom = room;
        }
      }
    });
    return selectedRoom; //if the roomname is not found then returns nothing
  }

  setName(name: String, socketId: String) {
    let user = this.getUserBySocketId(socketId);
    if (user != null) {
      user.setName = name;
    }
  }

  getAllUsers() {
    var users: User[] = [];
    let rooms = RoomManagement.rooms;
    rooms.forEach((room) => {
      for (var i = 0; i < room.users.length; i++) {
        users.push(room.users[i]);
      }
    });
    return users;
  }
}
