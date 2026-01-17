import {Router} from "express"
import { registerUser,loginUser, logOutUser ,refreshAccessToken,updateUserCoverImage} from "../controllers/user.controller.js"
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

router.route("/updatecoverimage").post(
    upload.fields([
        
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    
    updateUserCoverImage)



export {router}

//if we export the like {router} then we have to import like {router} but if we export default router then we can import directly like router 
