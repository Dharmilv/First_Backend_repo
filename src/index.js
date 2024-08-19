import dotenv from "dotenv"

import connect_DB from "./db/index.js";

dotenv.config()

connect_DB()


















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