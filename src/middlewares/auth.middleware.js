import { User } from "../models/User.model.js";
import { API_Error } from "../utils/API_Error.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asynchandler(async(req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new API_Error(401 , "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET )
    
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )
    
        if(!user){
            //todo discuss about front-end
            throw new API_Error(401,"Invalid access token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new API_Error(401, error?.message)    
    }
})