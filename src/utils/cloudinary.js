import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import fs from "fs"

//configuration of cloudnery

cloudinary.config({ 

        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
    });


const uploadFileToCloudinary= async (localFilePath)=>{
    try {
        if(!localFilePath)return null
        //upload file in cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        // console.log('file is uploaded at cloudinary',response.url);

         fs.unlinkSync(localFilePath)

        //code from the chatgpt

         // delete local file after success
    // if (fs.existsSync(localFilePath)) {
    //   fs.unlinkSync(localFilePath);
    // }

        return response
        

        
    } catch (error) {
        // // if the file has issue in uploading into the server otherwise file is not uploading then unlink the file into the local storage 
        fs.unlinkSync(localFilePath)
        // //this command is remove the file which is temporary store into the localstorage 

        //code from the chatgpt

    //    // delete local file if exists
    // if (fs.existsSync(localFilePath)) {
    //   fs.unlinkSync(localFilePath);
    // }

    return null;
    }

}

export {uploadFileToCloudinary}