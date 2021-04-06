import express from "express";
//import { checkAuth } from "../middleware/check-auth";
import { getAllRooms, getRoom } from "../controllers/p2pController";

var router = express.Router();

router.route("/rooms").get(getAllRooms);
router.route("/room").post(getRoom);

export default router;
