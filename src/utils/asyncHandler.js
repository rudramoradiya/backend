//use of it is we can not have to write the try catch block and we can not have to push all thing into the promise

const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))    }
}

export {asyncHandler}







// const asyncHandler=(fn)=>async (req,res,next)=>{
//     try {
//         await function(req,res,next)
        
//     } catch (error) {
//         res.status(error.code || 5000)
//         success:false,
//         message:error.message,
        
//     }
//         }