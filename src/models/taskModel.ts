import mongoose, { Schema, Types, model } from "mongoose";

interface ITask {
    description:string,
    completed:boolean,
    owner:Types.ObjectId
}

const taskSchema = new Schema<ITask>({
    description:{
        type:String,
        required:true,
        trim:true,
        minlength:5
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    }
},{
    timestamps:true
})

export const Task = model<ITask>("Task",taskSchema)