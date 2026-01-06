import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"


export const verifyJWT=asyncHandler(async(req,res,next)=>{
    //here the next means-->apna kam khatam ho gaya ab jaha jana he vaha jav

try {
        const token = req.cookie?.accessToken || req.header("Authorazation")?.replace("bearer ","")
    
        if(!token){
            throw new ApiError(401,"unauthorized request")
    
        }
    
        //if we have the token then we have to compair the details of the token 
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        // take the user
        // await because of the database work 
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            //TODO:discuuss about the frontend
            throw new ApiError(401,"invalid access token")
        }
    
        req.user=user
        next()
} catch (error) {
    throw new ApiError(401,error?.message || "invalide accesstoken")
    
}

})