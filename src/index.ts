import express, { Application, Express, Request, Response } from "express";
import authController from "./controllers/authController";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const port: String = process.env.PORT || "3000";

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/", async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Node Auth Service",
  });
});

app.use("/auth", authController);

app.listen(port, () => {
  console.log(`Auth API started at http://127.0.0.1:${port}`);
});
