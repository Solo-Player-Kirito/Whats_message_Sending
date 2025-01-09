const express = require("express");
const app = express();
const cors = require("cors");
const mongo = require("mongoose");
const PORT = process.env.PORT || 3001;

const DB =
  "mongodb+srv://sonusonu60019:whatsapp@wtp.zirpb.mongodb.net/?retryWrites=true&w=majority&appName=wtp";
require("dotenv").config();
app.use(cors());
app.use(express.json());

const chats = require("./routes/chat-route");

app.use("", chats);

mongo
  .connect(DB)
  .then(() => {
    console.log("Db connected");
  })
  .catch((err) => {
    console.log("error while connecting db", err);
  });
app.listen(PORT, () => {
  console.log("good server at : ", PORT);
});
