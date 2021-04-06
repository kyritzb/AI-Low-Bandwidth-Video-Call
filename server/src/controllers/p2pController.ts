import moment from "moment";
//import jwt from "jsonwebtoken";
import Response from "../models/Response";
//Local Imports
import RoomManagement from "../src/RoomManagement";
import Peer from "../models/User";
import { calculateDuration } from "../src/momentFunctions";

export async function getAllRooms(req: any, res: any) {
  let roomsArr = Array.from(RoomManagement.rooms);
  let rooms = [];
  for (let i = 0; i < roomsArr.length; i++) {
    let tempRoom = roomsArr[i][1];
    tempRoom.updateDuration();
    rooms.push(tempRoom);
  }

  let response = new Response(true, "", rooms);
  res.status(200).send(response);
}

export async function getRoom(req: any, res: any) {
  let room = RoomManagement.rooms.get(req.body.roomName);

  if (room) {
    let response = new Response(true, "", room);
    res.status(200).send(response);
  } else {
    let response = new Response(true, "", {});
    res.status(200).send(response);
  }
}
