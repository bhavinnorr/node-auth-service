"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const console_1 = require("console");
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || "3000";
const jwtSecret = process.env.SECRET || "ABCD";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsers = yield prisma.user.findMany();
    (0, console_1.log)(allUsers);
    res.json({
        success: true,
        message: "Node Auth Service",
        data: allUsers,
    });
}));
app.post("/auth/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        const { name, email, password } = user;
        const isEmailAlreadyExists = yield prisma.user.findFirst({
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
        const createUser = yield prisma.user.create({
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
    }
    catch (e) {
        (0, console_1.log)("Error", e);
        res.send({
            success: false,
            message: "Something went wrong!",
        });
    }
}));
app.post("/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        const { email, password } = user;
        const isEmailExists = yield prisma.user.findFirst({
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
        const isPasswordMatched = (isEmailExists === null || isEmailExists === void 0 ? void 0 : isEmailExists.password) === password;
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
        const token = jsonwebtoken_1.default.sign({ name: isEmailExists === null || isEmailExists === void 0 ? void 0 : isEmailExists.name, email: isEmailExists === null || isEmailExists === void 0 ? void 0 : isEmailExists.email }, jwtSecret, {
            expiresIn: "1d",
        });
        // send the response
        res.status(200).json({
            status: 200,
            success: true,
            message: "Login success",
            token: token,
        });
    }
    catch (_a) {
        res.status(200).json({
            success: false,
            message: "Something Went Wrong!",
        });
    }
}));
app.post("/auth/authenticate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        const user = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (user) {
            const email = user.email;
            const authenticaticatedUser = yield prisma.user.findFirst({
                where: {
                    email: email,
                },
            });
            if (authenticaticatedUser === null || authenticaticatedUser === void 0 ? void 0 : authenticaticatedUser.isActive) {
                res.json({
                    success: true,
                    message: "Authorized",
                    user: authenticaticatedUser,
                });
            }
            else {
                res.json({
                    success: true,
                    message: "Unauthorized. Disabled.",
                });
            }
        }
        else {
            res.json({
                status: 401,
                success: false,
                message: "Unauthorised",
            });
        }
    }
    catch (e) {
        res.json({
            status: 401,
            success: false,
            message: "Unauthorised",
        });
    }
}));
app.listen(port, () => {
    (0, console_1.log)(`Auth API started at http://127.0.0.1:${port}`);
});
