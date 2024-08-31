import { asynchandler } from "../utils/asynchandler.js";
import { API_Error } from "../utils/API_Error.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { API_Response } from "../utils/API_Response.js";

const registerUser =  asynchandler( async (req, res) => {
    const {username, fullname, email, password} = req.body
    console.log(username, fullname, email, password)

    if(fullname === ""){ 
        throw new API_Error(400, "fullname is required" )
    }
    else if(email === "" ){
        throw new API_Error(400, "email is required" )
    }
    else if(username === ""){
        throw new API_Error(400, "username is required" )
    }
    else if(password === ""){
        throw new API_Error(400, "password is required" )
    }

    const existingEmail = await User.findOne({email})
    
    if(existingEmail){
        throw new API_Error(400, "this email_id already exists")
    }

    const existingUsername = await User.findOne({username})
    
    if(existingUsername){
        throw new API_Error(400, "this username already exists")
    }

    const avatarLocalPath = await req.files?.avatar[0]?.path

    const coverImageLocalPath = await req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new API_Error(400 , "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
   
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new API_Error(400 , "Avatar file is required")
    }

    const user = await User.create({
        fullname,
        avatar : avatar?.url,
        coverImage : coverImage?.url || "" ,
        email,
        password,
        username: username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new API_Error(500, "something went wrong while registering user")
    }

    return res.status(201).json(
        new API_Response(200, createdUser, "User registered successfully")
    )
    
})

export {registerUser}