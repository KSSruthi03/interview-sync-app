import User from "../models/UserModel.js";
import Room from "../models/RoomModel.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { data } from "react-router-dom";




//***************1. USER REGISTRATION******************* */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Received registration data:", { name, email }); // Log received data

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword); // Log hashed password

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(), // Normalize email
      password: hashedPassword,
    });

    res.json({
      message: "User registered successfully", data: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





//**********************2. USER LOGIN*****************
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // const user = await User.findOne({ email });
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    console.log("user: ", user); // Log the found user
    if (!user) return res.status(400).json({ message: "User not found" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    // create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
    console.log("token:", token); // Log the generated token
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



//***************3. GET USER INFO*****************//

export const getUserInfo = async (req, res) => {

  try {

    const user = await User.findById(req.user.userId)
      .select("-password");

    res.json(user);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};





//*******************4.ROOM CREATE************************/

export const createRoom = async (req, res) => {
  try {

    // get logged-in user
    const user = await User.findById(req.user.userId);

    // only admin can create rooms-RBAC for admin room creation
    if (user.email !== process.env.ADMIN_EMAIL) {

      return res.status(403).json({

        success: false,

        message: "Only admin can create interview rooms"

      });

    }
    //generate random room ID
    const roomId = Math.random().toString(36).substring(2, 8);
    const { candidateEmail } = req.body;
    const joinLink = `http://localhost:3000/join/${roomId}`;
    const room = await Room.create({
      roomId,
      host: req.user.userId,
      participants: [req.user.userId],
    });

    // send email
    await sendEmail({
      to: candidateEmail,
      subject: "Interview Invitation",
      text: `You have been invited to an interview.
             Join using this link:${joinLink}`
    });

    res.status(201).json({
      message: "Room created! Interview invitation sent successfully",
      joinLink: "http://localhost:3000/join/abc123",
      room,
    });
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};




//********************5. JOIN ROOM CONTROLLER************************ */
export const joinRoom = async (req, res) => {
  try {
    // roomId sent from frontend
    const { roomId } = req.body;
    // find room in DB
    const room = await Room.findOne({ roomId });

    // room not found
    if (!room) {

      return res.status(404).json({
        message: "Room not found"
      });

    }


    // Add user to participants only if user is not already in the room
    await Room.findOneAndUpdate(
     { roomId },
  {
        $addToSet: {
          participants: req.user.userId
        }
      },

      { new: true }

    );

    // response
    res.json({
      message: "Joined room successfully",
      room
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });
  }
}
