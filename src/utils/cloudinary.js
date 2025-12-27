import {v2 as cloudinary} from "cloudinary"
import { log } from "console";
import fs from "fs"

//configuration of cloudnery

cloudinary.config({ 

        cloud_name:process.env.CLODINARY_CLOUD_NAME, 
        api_key:process.env.CLODINARY_API_KEY, 
        api_secret:process.env.CLODINARY_API_SECRET
    });


const uploadFileToCloudinary= async (localFilePath)=>{
    try {
        if(!localFilePath)return null
        //upload file in cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        console.log('file is uploaded at cloudinary',response.url);

        return response
        

        
    } catch (error) {
        // if the file has issue in uploading into the server otherwise file is not uploading then unlink the file into the local storage 
        fs.unlinkSync(localFilePath)
        //this command is remove the file which is temporary store into the localstorage 
    }

}

export {cloudinary}