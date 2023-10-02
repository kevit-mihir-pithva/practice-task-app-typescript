import mongoose from "mongoose"

export async function dbConnection():Promise<void> {
    try {
        await mongoose.connect("mongodb://localhost:27017/task-manager-ts")
        console.log("Connected to db..")
    } catch (error) {
        console.log(error)
    }
}

