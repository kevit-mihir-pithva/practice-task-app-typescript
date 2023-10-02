import { Model, Schema, HydratedDocument, model, Types } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Task } from './taskModel';


interface Token{
    token:string
}

interface IUser {
    name:string,
    age:number,
    email:string,
    password:string,
    tokens:Types.DocumentArray<Token>
}

interface IUserMethods {
    generateAuthToken():Promise<string>
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
    findByCredentials(email:string,password:string):Promise<HydratedDocument<IUser, IUserMethods>>
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        default:0,
        validate(value:number){
            if(value < 0){
                throw new Error("Age must be positive")
            }
        }
    },
    email:{
        type:String,
        unique:true,
        require:true,
        trim:true,
        lowercase:true,
        validate(value:string){
            if (!validator.isEmail(value)) {
                throw new Error("Email is invalid !")
            }
        }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(value:string){
            if(value.toLowerCase().includes("password")){
                throw new Error("Password can not contain 'password' ")
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true
})

userSchema.virtual("tasks",{
    ref:"Task",
    localField:"_id",
    foreignField:"owner"
})

userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id:user._id.toString() },"typescript")
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}


userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({ email })
    if(!user){
        throw new Error("Unable to login!")
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Unable to login!")
    }
    return user
}

userSchema.pre("save",async function(next){
    const user = this
    if(user.isModified("password")){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.post("findOneAndDelete", async function (user) {
    await Task.deleteMany({ owner : user._id });
})


export const User = model<IUser, UserModel>('User', userSchema);