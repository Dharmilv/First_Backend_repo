import { asynchandler } from "../utils/asynchandler.js";
import { API_Error } from "../utils/API_Error.js";
import { User } from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { API_Response } from "../utils/API_Response.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateRefreshToken()
        const refreshToken = user.generateAccessToken()
        user.refreshToken = refreshToken // => this is to store refresh token in database
        await user.save({vatlidateBeforeSave: false})
        return { accessToken , refreshToken }
    } catch(error){
        throw new API_Error(500,"something went wrong whie generation access and refresh token")
    }
} 

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

    console.log(avatarLocalPath)

    const coverImageLocalPath = await req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new API_Error(400 , "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    console.log("this is controller box => ",avatar)
   
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

const loginUser = asynchandler(async (req, res) => {
    //take email and password from user
    //check in db if both are same
    //give access and refreshtoken to login person

    const { email , password , username } = req.body
    console.log(email,username,password)
    if( !(email || username) ){
        throw new API_Error(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new API_Error(404, "user does not exist")
    }

    const isPasswordvalid = await user.isPasswordCorrect(password)

    if(!isPasswordvalid){
        throw new API_Error(404, "Invalid User credentials")
    }

    const { accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        //cookies modifiable only throgh server
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie(" ",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new API_Response(
            200, 
            {
            user : loggedInUser,accessToken,refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asynchandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    
    const options = {
        //cookies modifiable only throgh server
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new API_Response(200,{},"User Logged Out Successfully"))
})

export {registerUser, loginUser, logoutUser}