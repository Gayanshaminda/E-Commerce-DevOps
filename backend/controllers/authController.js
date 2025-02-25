import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    })

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    })

    return { accessToken, refreshToken }
}

const storeRefreshToken = async(userId, refreshToken) => {
    await redis.set(`refresh_token: ${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); //7 days
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent xss attacks, cross site scripting attack
        secure:process.env.NODE_ENV === "production",
        sameSite: "strict", // prevent CSRF attack, cross-site request frogery attack
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // prevent xss attacks, cross site scripting attack
        secure:process.env.NODE_ENV === "production",
        sameSite: "strict", // prevent CSRF attack, cross-site request frogery attack
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const signup = async(req, res) => {
    const { email, password, name } = req.body;

    // Log the request body to check if the fields are correctly passed
    console.log("Request Body:", req.body);

    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields (name, email, password) are required",
        });
    }

    try {
        // Check if the user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        // Create a new user
        const user = await User.create({ name, email, password });
        //  Authenticate the user 

        const { accessToken, refreshToken } = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);

        res.status(201).json({  
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,

            }, 
            message: "User created successfully",
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({success: false,message: "Internal server error",error: error.message,});
    }
};

export const login = async(req, res) => {
   try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if(user && (await user.comparePassword(password))){
        const {accessToken, refreshToken} = generateToken(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: "User logged in successfully",
        })}
    else{
        res.status(400).json({message: "Invalid email or password"});
    }
   } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
   }
};

export const logout = async(req, res) => {
   try {
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken){
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        await redis.del(`refresh_token: ${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
   } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });    
   }
};

// this will refresh the access token
export const refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if(!refreshToken){
            return res.status(401).json({message: "NO refresh token provided, please login"});
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token: ${decoded.userId}`);

        if(refreshToken !== storedToken){
            return res.status(401).json({message: "Invalid refresh token"});
        }
        const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});

        res.cookie("accessToken", accessToken, {
            httpOnly: true, // prevent xss attacks, cross site scripting attack
            secure:process.env.NODE_ENV === "production",
            sameSite: "strict", // prevent CSRF attack, cross-site request frogery attack
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
        res.json({message: "Access token refreshed successfully"});
    } catch (error) {
        console.log("Error in refreshToken controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
