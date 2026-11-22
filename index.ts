import express from "express";
import cors from "cors";
import "dotenv/config";
import Lab5 from "./Lab5";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to WebDev Server!");
});

Lab5(app);
app.listen(process.env.PORT || 4000, () => {
  console.log("Server running on http://localhost:4000");
});
