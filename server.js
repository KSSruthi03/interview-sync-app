import express from 'express';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import InterviewSync from './routes/Routes.js';

dotenv.config();

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;


//Database Connection
const db = mongoose.connect(process.env.MONGO_URL + process.env.DB_NAME);
db.then(() => {
    console.log("Connected to MOngodb🚀");
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err)
});


app.use('/api', InterviewSync);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});