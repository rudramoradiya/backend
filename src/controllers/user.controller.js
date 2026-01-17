import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"


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
    const {username,email,fullName,password} = req.body || {};
    console.log("email:",email) 

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

const loginUser=asyncHandler(async (req, res)=>{
    //get the data from the req.body
    //username and email
    //find the user
    //password check
    //access and refresh token
    //send cookie 

    

    // access the data from the body 
    const {username,email,password} = req.body || {};

    console.log(req.body)
    
    // Trim and normalize inputs to catch empty values early
    const usernameTrimmed = username?.trim() || "";
    const emailTrimmed = email?.trim() || "";
    const passwordTrimmed = password?.trim() || "";

    // debug: log incoming request headers to troubleshoot empty body issues
    console.log('req.headers:', req.headers);

    // username and email check 
    if(!emailTrimmed && !usernameTrimmed){
        throw new ApiError(400,"username or email is required")
    }

    // password must be present for login
    if(!passwordTrimmed){
        throw new ApiError(400,"password is required")
    }

    // Build search criteria using trimmed/lowercased values
    const criteria = [];
    if (emailTrimmed) criteria.push({ email: emailTrimmed.toLowerCase() });
    if (usernameTrimmed) criteria.push({ username: usernameTrimmed.toLowerCase() });

    const user = await User.findOne(criteria.length ? { $or: criteria } : {})

    //if user not found 

    if(!user){
    throw new ApiError(404,"User does not exists")
    }

    //if user found 

    const isPassWord=await user.isPasswordCorrect(passwordTrimmed)

    
     
    if(!isPassWord){
        throw new ApiError(401,"Invalid user credentials")
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

// here we have to make the endpoint where we refresh the access token
const refreshAccessToken = asyncHandler(async (req, res) => {

    //find the token from the user side
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    //this condition verify that thoken is coming or not 
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {

        //decode the token coming from the user and verify with the token held into the database 
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        // find the user from the decodedToken
        const user = await User.findById(decodedToken?._id)
    
        //check if the user is found or not and if the user not found give the error name invalid refresh token 
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        //here when we create the refreshtoken we save it into the user
        //so we have to match the incoming refreshToken and refreshToken held at the database 
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }


    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

//create the new password

const createNewPassword=asyncHandler(async(req,res)=>{

    //take the old and new password from the req,body
    const{oldPassword,newPassword,confPassword}=req.body

    if(newPassword===confPassword){
        throw new ApiError(404,"re-enter the confirm password")
    }

    //take the user 
    const user=await User.findById(req.user?._id)

    //we have the method called the isPasswordCorrect
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(404,"invalid old password")
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password changed successfully "))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(200,req.user,"current user get successfully")
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const{fullName,email}=req.body

    if(!fullName || !email){
        throw new ApiError(404,"fullname and email not found")

    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {new:true} //it gives the updated details directly 
    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"user details updated successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{

    const avatarLocalPath=req.file?.path //here use the file because here only one file available
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is missing")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar?.url){
         throw new ApiError(400,"error while uploading the avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

     return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar updated successfully"))

})

const updateUserCoverImage=asyncHandler(async(req,res)=>{

    const coverLocalPath=req.file?.path //here use the file because here only one file available
    if(!coverLocalPath){
        throw new ApiError(400,"coverImage file is missing")
    }

    // Get the current user to retrieve old cover image URL
    const currentUser = await User.findById(req.user?._id)
    
    // Delete old cover image from Cloudinary if it exists
    if(currentUser?.coverImage){
        await deleteFromCloudinary(currentUser.coverImage)
    }

    const coverImage=await uploadOnCloudinary(coverLocalPath)

    if(!coverImage?.url){
         throw new ApiError(400,"error while uploading the avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

     return res
    .status(200)
    .json(new ApiResponse(200,user,"coverImage updated successfully"))

})

const getUserChannelProfile=asyncHandler(async(req,res)=>{

    const{username}=req.params
    if(!username?.trim()){
        throw new ApiError(400,"username not found")
    }
    const channel=await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",  //here the name is convert to lower case and also be plural
                localField:"_id",
                foreignField:"channel",
                as:"subscriber"
            }
        },
        {
            $lookup:{
               from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $con:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                email:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                channelsSubscribedToCount:1,
                isSubscribed:1


            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(400,"channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,channel[0],"user channel fetched successfully ")
    )
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user = await User.aggregate([
        {
            //  _id:req.user._id // this is not working because here the code of the aggregate pipeline is send directly not throgh the mongoose 
            $match:{
            _id:new mongoose.types.ObjectID(req.user._id)
            }
        },
        {
            from :"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from :"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[{
                            $project:{
                                fullName:1,
                                username:1,
                                avatar:1
                            }
                        }]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
            ]
        }
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory
        )
    )
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    createNewPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}

