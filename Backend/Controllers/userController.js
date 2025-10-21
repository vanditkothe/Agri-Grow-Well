import userModel from "../Models/userModel.js";
import tokenModel from "../Models/tokenModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userValidationSchema from "../SchemaValidation/userValidationSchema.js";
import dotenv from "dotenv";
dotenv.config();

const signup = async(req,res)=>{
    try{
        console.log("Signup starting");
        const { error, value } = userValidationSchema.validate(req.body);
        if (error) {
        return res.status(400).json({ msg: error.details[0].message });
        }
        const {firstName, lastName, email, password, farmLocation, farmSize, primaryCrops, agreeTerms, agreePrivacy} = value;
        console.log("Data coming from request body--->", {firstName, lastName, email, password, farmLocation, farmSize, primaryCrops, agreeTerms, agreePrivacy});

        if(!firstName || !lastName || !email || !password || !farmLocation || !farmSize || !primaryCrops){
            return res.status(401).json({msg: "Incomplete fields, Kindly fill all the required fields and then log in"});
        }

        //check for uniqueness of email
        const isUniqueEmail = await userModel.findOne({email: email});
        if(isUniqueEmail){
            return res.status(402).json({msg: `An account with ${email} exists. Try Signing up with another email`});
        }

        const hashedPassword = await bcrypt.hash(password,10);
        console.log("Password has been hashed, now moving forward to making a data object to create user.");

        const userData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            farmLocation:farmLocation,
            farmSize: farmSize,
            primaryCrops: primaryCrops,
            agreeTerms: agreeTerms,
            agreePrivacy: agreePrivacy
        }

        console.log("The new user that we are going to create: ", userData);

        const newUser = new userModel(userData);
        await newUser.save();

        return res.status(200).json({msg: "User registered successfully!"});
    }catch(err){
        console.log("This error has occurred in the backend while registering user---->",err);
        return res.status(500).json({msg: "Internal Server Error has occurred"});
    }

}

const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt for email--->", email);

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                msg: "Email and password are required"
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(401).json({
                success: false,
                msg: "Invalid email or password"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                msg: "Invalid email or password"
            });
        }

        // Check if user account is active (optional)
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                msg: "Your account has been deactivated. Please contact support."
            });
        }

        // Generate access token (short-lived)
        const accessToken = jwt.sign(
            { 
                userId: user._id, 
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: '15m' } // 15 minutes
        );

        // Generate refresh token (long-lived)
        const refreshToken = jwt.sign(
            { 
                userId: user._id,
                email: user.email
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' } // 7 days
        );

        // Save refresh token to database
        const tokenData = new tokenModel({
            userId: user._id,
            token: refreshToken,
            type: 'refresh',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
        await tokenData.save();

        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save();

        // Set refresh token as httpOnly cookie for security
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        console.log("User logged in successfully--->", user.email);

        // Return access token and user info
        return res.status(200).json({
            success: true,
            msg: "Login successful",
            accessToken: accessToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                farmLocation: user.farmLocation,
                farmSize: user.farmSize,
                primaryCrops: user.primaryCrops
            }
        });

    } catch(err) {
        console.log("Error occurred during login--->", err);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error has occurred"
        });
    }
}

// Logout function
const logout = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const userId = req.user?.userId; // From auth middleware

        console.log("Logout attempt for user--->", userId);

        // If refresh token exists, remove it from database
        if (refreshToken) {
            await tokenModel.deleteOne({ token: refreshToken });
            console.log("Refresh token removed from database");
        }

        if (userId) {
             await tokenModel.deleteMany({ userId: userId });
             console.log("All tokens removed for user:", userId);
        }

        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        console.log("User logged out successfully");

        return res.status(200).json({
            success: true,
            msg: "Logout successful"
        });

    } catch(err) {
        console.log("Error occurred during logout--->", err);
        return res.status(500).json({
            success: false,
            msg: "Internal Server Error has occurred"
        });
    }
}

export default {signup, login, logout};