import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"

// it give the controll of the user
const registerUser=asyncHandler(async (req,res)=>{

//we have to register the user
    // step 1: get the data from the req body
    // step 2:validation -- not empty
    // step 3: check if user already exists : username, email
    // step 4: check for images and check for the avatar
    // step 5: upload them to cloudnary ,avatar
    // step 6: create the use object--create entry in db
    // step 7: remove the password and refresh token from response        //we do not want to give the password to the user rather than password feild is incrypted
    // step 8: check for the user creation        //check user create or not ?
    // step 9: return response


    // req.body ==>> if the data is coming from the form or json file then we get like this 
    const {username,email,fullName,password}=req.body
    console.log("email:",email) 

    // check each field that not empty 

    //here we have to apply the if else condition for all the field this is not allow in the production level code
    if(fullName==""){
        throw new ApiError(400,"enter the valid fullName")
    }

    // we use the some filtering to  do the validation on the each field

    if (
        [username,email,fullName,password].some((field)=>field?.trim()==="")
    ){
       throw new ApiError(400,"all the fields are required")
    }

    //check user exists or not 

    const existedUser= User.findOne({
        $or: [{username},{email}]   //purpose : if username or email found it throw the error
    })

    if(existedUser){
        throw new ApiError(409,"user is already exists")
    }
    

    // step 4: check for images and check for the avatar

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    const avatar_coverImage=User.findOne({
        $or:[{avatarLocalPath},{coverImageLocalPath}]
    })

    if(avatar_coverImage){
        throw new ApiError(400,"avatar or coverImage required")
        
    }
    // console.log(req.body);
    

    // step 5: upload them to cloudnary ,avatar

    
    const avatar= await uploadFileToCloudinary(avatarLocalPath)
    const coverImage= await uploadFileToCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar or coverImage required")
    }

    // step 6: create the use object--create entry in db

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage.url,
        password,
        email,
        username:username.toLowerCase()
    })

     // step 7: remove the password and refresh token from response 
    //check user is created or not 

    const createdUser=User.findOne(user._id).select(
        "-password -refreshToken"
    )

    //in above syntex ,
    //_id:in mongodb after the each field this id will be connected
    //select: select all the field but if we do not want some secure feild then we have to add the minus(-) before the feild 
    // step 8: check for the user creation
    
    if(!createdUser){
        throw new ApiError(500,"something went wrong when registring the User")
    }

    //here 5XX used to give the error when the human falut

    //return the response

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user successfully registred")
    )





    
    


    res.status(200).json({
        message:"ok"
    })
})

export {registerUser}