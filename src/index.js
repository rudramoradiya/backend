// import mongoose, { mongo } from "mongoose"
// import { DB_NAME } from "./constants";
// import express from "express"
// require('dotenv').config({path:'./env'})   older version
import dotenv from "dotenv"
import connectDB from "./db/index.js";


dotenv.config({
    path:'./env',
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("mongo ds connection failed !!!",err)
})












//this is the first approch to connect the database(by ifi)

// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR",error)
//             throw err
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`app is listening on port ${process.env.PORT}`)

//         })
//     }catch(error){
//         console.log("ERROR",error)
//         throw err
//     }
// })()