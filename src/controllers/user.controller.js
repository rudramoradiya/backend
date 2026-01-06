import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { response } from "express"

const generateAccessAndRefreshTokens=async (useID)=>{
    try {

        const user=await User.findById(useID)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        //here we have to save the refresh token to the database

        user.refreshToken=refreshToken
        //we have to save the detailes without validating the defore anything 
        // because of the database work it take the time hence we have to use the await 
        user.save({validateBeforeSave:false})
        
        return {refreshToken,accessToken}
    
    } catch (error) {
        throw new ApiError(500,"this is error while generating the refresh or access token")
    }
}

// it give the controll of the user
const registerUser = asyncHandler( async (req, res) => {
    console.log("hi")

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
    const {username,email,fullName,password}=req.body;
    // console.log("email:",email) 

    // check each field that not empty 

    //here we have to apply the if else condition for all the field this is not allow in the production level code
    // if(fullName==""){
    //     throw new ApiError(400,"enter the valid fullName")
    // }

    // we use the some filtering to  do the validation on the each field

    if(
        [username,email,fullName,password].some((field)=>field?.trim()==="")
    ){
       throw new ApiError(400,"all the fields are required")
    }

    //check user exists or not 

    const existedUser=await User.findOne({
        $or: [{ username },{ email }]   //purpose : if username or email found it throw the error
    })
    // console.log('existeed user',existedUser);
    

    console.log("Existing user:", existedUser);

    if(existedUser){
        // ADD THIS LINE:
    // console.log("MATCH FOUND IN DB:", existedUser);
        throw new ApiError(409,"user is already exists")
    }
    

    // step 4: check for images and check for the avatar

    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;

    // const avatar_coverImage=await User.findOne({
    //     $or:[{avatarLocalPath},{coverImageLocalPath}]
    // })

    // if(avatar_coverImage){
    //     throw new ApiError(400,"avatar or coverImage required")
        
    // }/


    //below code written for to check how it handle the error when coverimage is not given

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    


    // console.log(req.body);
    

    // step 5: upload them to cloudnary ,avatar

    
    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar or coverImage required")
    }

    // step 6: create the use object--create entry in db

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        password,
        email,
        username:username.toLowerCase()
    })

     // step 7: remove the password and refresh token from response 
    //check user is created or not 

    const createdUser=await User.findById(user._id).select(
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





    
    


    // res.status(200).json({
    //     message:"ok"
    // })
})

const loginUser=asyncHandler(async (req,res)=>{
    //get the data from the req.body
    //username and email
    //find the user
    //password check
    //access and refresh token
    //send cookie 


    // access the data from the body 
    const{email,username,password}=req.body

    //username and email check 
    if(!email || !username){
        throw new ApiError(400,"username or email not found ")
    }

    //find the user
    // this find the user based on the username or email 
    // because the database is in the another continent we have to add the await 
    //$or:-is the operator of the mongodb 

    const user =User.findOne({
        $or:[{username},{email}]
    })

    //if user not found 

    if(!user){
    throw new ApiError(404,"User does not exists")
    }

    //if user found 

    const isPassWord=await user.isPasswordCorrect(password)
     
    if(!isPassWord){
    throw new ApiError(401,"invalid user crediatial ")
    }

    // here we have to generate the access and refresh token multiple time so we make the function of it 

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    // then we have to send the data to cookie 

    // here first decide that what data should not be send to user

    const loggedInUser=await User.findById(user._id).select("-password,-refreshToken")

    // to make the cookie we have to design like object 

    const options ={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,accessToken,refreshToken

            },
            "user login successfully"
        )
    )

})

// logout the user

const logOutUser=asyncHandler(async(req,res)=>{

    //here we have to do two task
    // 1--> remove the cookie 
    // 2--> clear the refreshtoken 

    User.findByIdAndUpdate(
       await req.user._id,
        {
            //use the method of the mongodb to set the refreshtoken as undifined
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out "))


})
export {
    registerUser,
    loginUser,
    logOutUser
}

