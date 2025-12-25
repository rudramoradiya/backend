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


export default app