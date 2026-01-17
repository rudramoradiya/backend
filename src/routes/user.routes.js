import {Router} from "express"
import { registerUser,loginUser, logOutUser ,refreshAccessToken,updateUserCoverImage, getCurrentUser, updateAccountDetails, updateUserAvatar, getUserChannelProfile, getWatchHistory} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router=Router()

router.route("/register").post(
    
    upload.fields([
        {
            name:"avatar",  //in frontend we have to give the same name 
            maxCount:1    // how many feild you accept
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser,
)

//here we use the post method because we take the information from the user
// Accept `application/json` and `multipart/form-data` (no files) for login
router.route("/login").post(upload.none(), loginUser)

//here we take the verification from the auth verification

//secured routes
router.route("/logout").post(verifyJWT,logOutUser)

router.route("/refreshToken").post(refreshAccessToken)

//change the password 

router.route("/changePassword").post(verifyJWT,createNewPassword)

//getting the currunt user
router.route("/current-user").get(verifyJWT,getCurrentUser)

//update account details 
router.route("/update-account-details").patch(updateAccountDetails)  // here the patch is used because change in only updated details not in all 

// update the avatar

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

// update the coverImage

router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

// get the user profile 
//here we take the data from the params so we have to /c/:username use this type of syntax

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

// ger the watchhistory 

router.route("/history").get(verifyJWT,getWatchHistory)



export {router}

//if we export the like {router} then we have to import like {router} but if we export default router then we can import directly like router 
