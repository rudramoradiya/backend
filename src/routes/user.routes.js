import {Router} from "express"
import { registerUser } from "../controllers/user.controller.js"

const router=Router()

router.route("/register").post(registerUser)


export {router}

//if we export the like {router} then we have to import like {router} but if we export default router then we can import directly like router 
