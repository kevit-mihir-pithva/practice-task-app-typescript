import {Router , Request ,Response} from "express"
import {Task} from "../models/taskModel"
import {Req, auth} from "../middleware/auth";

export const taskRouter = Router()

taskRouter.post("/tasks", auth, async (req:Req, res:Response) => {
    try {
      const task = new Task({
        ...req.body,
        owner: req.user._id,
      });
      await task.save();
      res.status(201).send(task);
    } catch (error) {
      res.status(400).send("Error: " + error);
    }
})

taskRouter.get("/tasks", auth, async (req:Req, res:Response) => {
   try {
    const tasks = await Task.find({owner:req.user._id})
    res.send(tasks)
   } catch (error) {
    res.status(500).send("Error: " + error);
   }
})

taskRouter.patch("/tasks/:id", auth, async (req:Req, res:Response) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate) {
      return res.status(400).send("Error: Invalid updates");
    }
    try {
      const _id = req.params.id;
      const task = await Task.findOne({ _id, owner: req.user._id });
      if (!task) {
        return res.status(400).send();
      }
      updates.forEach((update) => (task[update] = req.body[update]));
      await task.save();
      res.send(task);
    } catch (error) {
      res.status(400).send("Error: " + error);
    }
  })

  taskRouter.delete("/tasks/:id", auth, async (req:Req, res:Response) => {
    try {
      const _id = req.params.id;
      const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
      !task ? res.status(404).send() : res.send(task);
    } catch (error) {
      res.status(500).send("Error: " + error);
    }
  })