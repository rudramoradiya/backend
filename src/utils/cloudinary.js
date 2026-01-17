import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

//configuration of cloudnery

cloudinary.config({ 

        cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
        api_key:process.env.CLOUDINARY_API_KEY, 
        api_secret:process.env.CLOUDINARY_API_SECRET
    });


const uploadOnCloudinary= async (localFilePath)=>{
    try {
        if(!localFilePath)return null
        //upload file in cloudinary
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        // console.log('file is uploaded at cloudinary',response.url);
        console.log("hey i am uploading....")

        //  fs.unlinkSync(localFilePath)

        //code from the chatgpt

         // delete local file after success
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

        return response
        

        
    } catch (error) {

        console.log("hey i am not uploading....")
        // // if the file has issue in uploading into the server otherwise file is not uploading then unlink the file into the local storage 
        // fs.unlinkSync(localFilePath)
        // //this command is remove the file which is temporary store into the localstorage 

        //code from the chatgpt

    //    // delete local file if exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
    }

}

const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) return null;
        
        // Extract the public_id from the URL
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/public_id.extension
        const parts = imageUrl.split('/');
        const fileNameWithExtension = parts[parts.length - 1];
        const publicId = fileNameWithExtension.split('.')[0];
        
        // Delete the image from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId);
        console.log("Image deleted from Cloudinary:", response);
        return response;
    } catch (error) {
        console.log("Error while deleting image from Cloudinary:", error);
        return null;
    }
};

export {uploadOnCloudinary, deleteFromCloudinary}