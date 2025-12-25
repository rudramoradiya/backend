

const asyncHandler=(requesrHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requesrHandler(req,res,next)).catch((err)=>next(err))    }
}

export default asyncHandler







// const asyncHandler=(fn)=>async (req,res,next)=>{
//     try {
//         await function(req,res,next)
        
//     } catch (error) {
//         res.status(error.code || 5000)
//         success:false,
//         message:error.message,
        
//     }
//         }