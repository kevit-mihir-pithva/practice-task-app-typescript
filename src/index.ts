import express , {Request,Response} from 'express'
import { dbConnection } from './db/mongoose'
import {userRouter}  from './routers/userRoute'
import {taskRouter}  from './routers/taskRoute'

dbConnection()

const app = express()
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

const port = 3000;

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
})