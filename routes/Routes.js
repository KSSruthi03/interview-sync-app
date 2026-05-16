import { Router } from "express";
import authMiddleware from "../middleware/Middleware.js";

import {
  register, login,
  getUserInfo, createRoom, joinRoom
} from "../controller/AuthController.js";

const InterviewSync = Router();

// // TEST ROUTE
// InterviewSync.get("/test", (req, res) => {
//   res.send("working");
// });



//registration and login routes
InterviewSync.post("/register", register);

InterviewSync.post("/login", login);




//get user info route (protected)
InterviewSync.get("/getuser",authMiddleware, getUserInfo);

//create room route (protected)
InterviewSync.post("/createroom", authMiddleware, createRoom); 

//join room route (protected) - to be implemented
InterviewSync.post("/joinroom", authMiddleware, joinRoom);



export default InterviewSync;