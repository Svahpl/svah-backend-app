import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import { LoginUser, UserSchema} from "../utils/auth.validation.js";

export const signup = async (req, res) => {
    try {
        console.log(req.body)
        const { data, error } = UserSchema.safeParse(req.body);
        if (error) {
            return res.json({
                message: error.errors[0].message,
            });
        }
        const {FullName , Email, Password } = data;
        const userExists = await User.findOne({ Email });
        if (userExists)
            return res.status(400).json({
                msg: "Email Already Exists",
            });
        const hashed_password = await bcrypt.hash(Password, 10);
        const newUser = await new User({
            Email,
            Password: hashed_password,
            isAdmin: "false",
            FullName,
        });
        await newUser.save();
        return res.status(200).json({ msg: "Success" });
    } catch (error) {
        console.log(`Error during signup from controller: ${error}`);
    }
};

export const login = async (req, res) => {
    try {
        const { data, error } = LoginUser.safeParse(req.body);
        if (error) {
            return res.json({
                message: error.errors[0].message,
            });
        }

        const { Email, Password } = data;
        console.log(data);
        const userExists = await User.findOne({ Email });
        if (!userExists) {
            // Never let anyone know what is wrong where. eg. hackers
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        const user = await userExists.comparePassword(Password);
        const token = await userExists.generateAuthToken();
        console.log(token);
        const option = {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            secure: false, // Set to true if using HTTPS
        };
        if (user) {
            res
                .status(200)
                .cookie("authToken", token, option)
                .json({
                    message: "Login successful",
                    token,
                    userId: await userExists._id.toString(),
                    isAdmin: await userExists.isAdmin,
                });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
        console.log("login controller error", error);
    }
};