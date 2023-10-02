import { NextFunction, Request,Response } from 'express'
import jwt from 'jsonwebtoken'
import {User} from '../models/userModel'

export interface Req extends Request{
    user:any,
    token:string
}

export async function auth(req:Req,res:Response,next:NextFunction) {
    try {
        const token = req.header("Authorization").replace("Bearer ","")        
        const decode = jwt.verify(token,process.env.JWT_SECRETE_KEY)
        const user = await User.findOne({
            _id:decode._id,
            "tokens.token":token
        })
        if(!user){
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (error) {
        res.status(401).send(error)
    }
}