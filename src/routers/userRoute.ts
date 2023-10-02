import {Router , Request ,Response} from "express"
import {User} from "../models/userModel"
import {Req, auth} from "../middleware/auth";

export const userRouter = Router();

userRouter.post("/users",async (req:Request,res:Response) => {
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user , token })
    } catch (error) {
        res.status(400).send(error)
    }
})

userRouter.post("/users/login",async (req:Request,res:Response) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send("Error: " + error);
    }
})

userRouter.post("/users/logout", auth, async (req:Req,res:Response) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send("Error: " + error);
    }
})

userRouter.post("/users/logoutAll", auth, async (req:Req,res:Response) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send("Error: " + error);
    }
})

userRouter.get("/users/me", auth, async (req:Req,res:Response) => {
    res.send(req.user);
})

userRouter.patch("/users/me", auth, async (req:Req,res:Response) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "age", "email", "password"];
    const isValidUpdate = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!isValidUpdate) {
        return res.status(400).send("Error: Invalid updates");
    }
    try {
        updates.forEach((update) => (req.user[update] = req.body[update]));
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(400).send("Error: " + error);
    }
})

userRouter.delete("/users/me", auth, async (req:Req,res:Response) => {
    try {
        await User.findOneAndDelete(req.user)
        res.send(req.user);
    } catch (error) {
        res.status(500).send("Error: " + error);
    }
})