import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"

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
    registerUser
)


export {router}

//if we export the like {router} then we have to import like {router} but if we export default router then we can import directly like router 
