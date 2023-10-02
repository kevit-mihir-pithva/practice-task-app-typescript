import mongoose from "mongoose"

export async function dbConnection():Promise<void> {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to db..")
    } catch (error) {
        console.log(error)
    }
}

