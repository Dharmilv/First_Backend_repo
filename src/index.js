import dotenv from "dotenv"
import connect_DB from "./db/index.js";
import { app } from "./app.js";

dotenv.config()

connect_DB()
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`server is running on port ${process.env.PORT}`)
    })
})
.catch((err) =>{
    console.log("MongoDB connection fail ", err)
})

















// const DB_Connect = async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error", (error)=> {
//             console.log("error: ",error)
//         })
//         app.listen(process.env.PORT, ()=>{
//             console.log(`app is listening on port ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.log("error, ", error)
//     }
// }

// DB_Connect()