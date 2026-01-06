import {Router} from "express"
import { registerUser,loginUser, logOutUser } from "../controllers/user.controller.js"
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

//here we use the post method because we take the information from tthe user
router.route("/login").post(loginUser)

//here we take the verification from the auth verification

//secured routes
router.route("/logout").post(verifyJWT,logOutUser)



export {router}

//if we export the like {router} then we have to import like {router} but if we export default router then we can import directly like router 
