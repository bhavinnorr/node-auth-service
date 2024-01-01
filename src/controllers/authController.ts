import express, { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import prisma from "../config/prisma";

interface Token {
  name: string;
  email: string;
}

const jwtSecret: Secret = process.env.SECRET || "ABCD";
const router = express.Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const user = req.body;
    const { name, email, password } = user;
    const isEmailAlreadyExists = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (isEmailAlreadyExists) {
      res.json({
        success: false,
        message: "Email Already Exists!",
        isEmailAlreadyExists: [isEmailAlreadyExists, user],
      });
      return;
    }
    const createUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: password,
      },
    });
    res.json({
      success: true,
      message: " User created Successfully",
      user: createUser,
    });
  } catch (e) {
    console.log("Error", e);
    res.send({
      success: false,
      message: "Something went wrong!",
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const user = req.body;
    const { email, password } = user;
    const isEmailExists = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!isEmailExists) {
      res.json({
        success: false,
        message: "Email Doesn't Exists!",
        isEmailAlreadyExists: [isEmailExists, user],
      });
      return;
    }
    const isPasswordMatched = isEmailExists?.password === password;

    // ** if not matched send response that wrong password;

    if (!isPasswordMatched) {
      res.status(400).json({
        status: 400,
        success: false,
        message: "wrong password",
      });
      return;
    }

    // ** This is our JWT Token
    const token = jwt.sign(
      { name: isEmailExists?.name, email: isEmailExists?.email },
      jwtSecret,
      {
        expiresIn: "1d",
      }
    );

    // send the response
    res.status(200).json({
      status: 200,
      success: true,
      message: "Login success",
      token: token,
    });
  } catch {
    res.status(200).json({
      success: false,
      message: "Something Went Wrong!",
    });
  }
});

router.post("/authenticate", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const user = jwt.verify(token, jwtSecret);
    if (user) {
      const email = (user as Token).email;
      const authenticaticatedUser = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });
      if (authenticaticatedUser?.isActive) {
        res.json({
          success: true,
          message: "Authorized",
          user: authenticaticatedUser,
        });
      } else {
        res.json({
          success: true,
          message: "Unauthorized. Disabled.",
        });
      }
    } else {
      res.json({
        status: 401,
        success: false,
        message: "Unauthorised",
      });
    }
  } catch (e) {
    res.json({
      status: 401,
      success: false,
      message: "Unauthorised",
    });
  }
});

export default router;
