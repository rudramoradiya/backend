import express from 'express';
import cors from "cors"
import cookieParser from 'cookie-parser';

//cors and cookie parser ic configuration after app is made

const app=express()


// express configuration

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credential:true,
}))

// this all are the inbuilt in the express 

app.use(express.json({limit:"16kb"})) //express only get the json file untill the 16 kb
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import

import {router} from "./routes/user.routes.js"

//routes declarration

// app.get not used because here the saparate file of the routers
// we have to use the middleware to decalare the router

//best practices: if you define your api then tell that you define the api and what is the version of the api 
app.use("/api/v1/user",router)


export {app}