import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const authenticateToken = async(req, res, next) =>{
    try{
        console.log("starting middleware function....");
        const accessToken = req.cookies.accessToken;

        console.log("accessToken has been retrieved");
        if(!accessToken){
            return res.status(400).json({msg:"User not logged in, token missing."});
        }

        console.log("Now we are verifying the accessToken");

        jwt.verify(accessToken, process.env.ACCESS_SECRET, (error, user)=>{
            if(error){
                return res.status(403).json({msg:"Some error has occurred.", error: error});
            }
            console.log("The current user in the backend is--->", user);
            req.user = user;

            next();
        })

    }catch(err){
        return res.status(500).json({mag: "Internal Server Error in token controller"});
    }
}

export default authenticateToken;