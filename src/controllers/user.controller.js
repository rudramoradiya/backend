import {asyncHandler} from "../utils/asyncHandler.js"

// it give the controll of the user
const registerUser=asyncHandler(async (req,res)=>{
    res.status(200).json({
        message:"ok"
    })
})

export {registerUser}