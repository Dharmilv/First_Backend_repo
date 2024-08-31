import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name : "dvdpqerzw", 
    api_key : "631532587984429", 
    api_secret : "gH5ebBFrt_4Ejj_Hz5nfPcx7VM4", 
});

const uploadOnCloudinary= async (localfilepath)=>{
    try {
       if(!localfilepath) return null
       //upload file on cloudinary
       const response = await cloudinary.uploader.upload(localfilepath,{
        resource_type:"auto"
       })
       // file uploaded successfully on cloudinary
       console.log("file uploaded on cloudinary",response.url)
       fs.unlinkSync(localfilepath)
       return response;
    }
    catch(error)
    {
        console.log(error)
     fs.unlinkSync(localfilepath) // remove the locally saved temporary file as the upload operation got failed
     return null;
    }
}

export {uploadOnCloudinary}

