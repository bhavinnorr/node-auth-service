import express, { Application, Express, Request, Response } from "express";
import { PrismaClient } from '@prisma/client'
import jwt, { DecodeOptions, Secret } from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import { log } from "console";

const prisma = new PrismaClient()
dotenv.config()

interface Token {
    name: string;
       email: string;
  }

const app: Application = express();
const port: String = process.env.PORT || "3000";
const jwtSecret: Secret = process.env.SECRET || "ABCD";
app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
)
app.get('/', async (req: Request, res: Response) => {
    const allUsers = await prisma.user.findMany();
    log(allUsers);
    res.json({
        success: true, 
        message:"Express + Typescript Server", 
        data: allUsers
    });
})

app.post('/auth/register', async (req: Request, res: Response)=>{
    try{
        const user = req.body;
        const { name, email, password } = user;
        const isEmailAlreadyExists = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if (isEmailAlreadyExists){
            res.json({
                success: false,
                message: "Email Already Exists!",
                isEmailAlreadyExists: [isEmailAlreadyExists, user]
            })
            return;
        }
        const createUser = await prisma.user.create({
            data: {
              email: email,
              name: name,
              password: password
            },
        });
        res.json({
            success: true,
            message: " User created Successfully",
            user: user,
        });
    } catch (e) {
        log("Error", e);
        res.send({
            "success":false,
            "message":"Something went wrong!"
        })
    }
})


app.post('/auth/login', async (req: Request, res: Response)=>{
    try{
        const user = req.body;
        const { email, password } = user;
        const isEmailExists = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if (!isEmailExists){
            res.json({
                success: false,
                message: "Email Doesn't Exists!",
                isEmailAlreadyExists: [isEmailExists, user]
            })
            return;
        }
        const isPasswordMatched =
        isEmailExists?.password === password;

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
      const decoded = jwt.verify(token, jwtSecret);
  
      // send the response
      res.status(200).json({
        status: 200,
        success: true,
        message: "login success",
        token: token,
        user: (decoded as Token)
      });
    } catch {

    }
})

app.listen(port, () => {
    log(`Auth API started at http://127.0.0.1:${port}`);
})