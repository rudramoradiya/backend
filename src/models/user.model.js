import mongoose, {Schema} from "mongoose"
// import { use } from "react"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true // to enter the field into the serching of the database
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
         fullName:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
         avatar:{
            type:String,  // use the url of the cloudnery
            required:true,
           
        },
        coverImage:{
            type:String,   // use the url from the cloudnery

        },
        watchHistory:[   // when the many data is want to store than we have to use the array of object
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{    // we have to inscrpty the password but it is difficult to compare the imcripty value
            type:String,
            required:[true,"password is required"]
        },
        refreshToken:{
            type:String   // this is long string 
        }

    },
    {
        timestamps:true
    }
)
// pre hook of mongoose
//used to apply change just before the event hit
// here we cannot use the array function because it can not have the contex
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next(); //bassic syntax
    this.password=bcrypt.hash(this.password,10)      //hash take parameter:jema tame change akrva mango e , number of rounds
    next()
} )


// make the custome hooks to check the password is correct or not 

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)      // because of creptography it take the time so we have to use the await statement 
}

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(  //this method generate the token
    {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    } ,
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}

userSchema.methods.generateRefreshToken = async function (){
    return jwt.sign(  //this method generate the token
    {
        _id: this._id,
      
    } ,
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)   
}


export const User=mongoose.model("User",userSchema)

// JWT is the bearer token = send the data if someone send the token



//file uploading strategy:
// first we have to take the file from the user using the nmulter
// then store into the local storage 
// using the cloudnery we can store the file into the server from the local storage 

