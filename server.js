const express = require('express')
const bodyParser = require('body-parser');
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
const app = express()

// Load environment variables
dotenv.config();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const users = [
    {
        username: "abc",
        task:{
            name: 'main',
            taskId: "main1",
            status: 'completed',
            task:
            [
                {
                    taskName: "task1",
                    taskId: "1",
                    status: 'completed',
                }
            ]
        },
    }
]

console.log(users)

//current user
app.get('/get-user', authenticateToken, (req, res) => {
   const currentUser = users.find(user => user.username == req.body.username && user.password == req.body.password)
   res.send(currentUser).status(200)
})

//create user
app.post('/create-user', (req, res) => {
    const { body: reqBody } = req;
  //console.log(req.body)

  try {
    return res
      .status(200)
      .json({ status: true, message: "user created successfullly" });
  } catch (err) {
    return console.log(err);
  }
    
})

//create task
app.post('/create-task', authenticateToken, (req, res) => {
    console.log(req.body.task,req.body.username, req.body.taskId )
    const task = {tasks: req.body.task, username: req.body.username, taskId: req.body.taskId }
    users.filter(user => {
        if(user.username == task.username) {
            if(!user.task.length)
                return user.task.push(task.tasks)
        }
    })
    res.send(users)
})

// user login
app.post('/login', (req, res) => {
    console.log(req.body.username, req.body.password)
    if(req.body.username && req.body.password) {
        const user = users.find(user => user.username == req.body.username && user.password == req.body.password)
        const userProvided = {username: req.body.username}
        const accessToken = jwt.sign(userProvided, process.env.ACCESS_TOKEN_SECRET)
        if(user){
            res.send({accessToken: accessToken})
        }
    }
    res.send({
        message: 'Invalid credentials',
    })
    
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(!token) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userProvided) => {
        if(err) return res.sendStatus(403)
        req.user = userProvided
        next()
    })
}

app.put('/update-user', authenticateToken, (req, res) => {
    const user = {username: req.body.username, password: req.body.password}
    users.push(user)
    res.send({
        message: 'User updated successfully',
    }).status(200)
})

// delete task
app.post('/delete-task', authenticateToken, (req, res) => {
    let statusResponse = false
    if(user){
        users.forEach((item, index) => {
            if(item.task){
                if(item.task.status == 'completed') {
                let arr = []
                arr.push(item.task)
                arr.forEach(element => {
                    element.status == 'completed'
                    statusResponse = !statusResponse
                })
                }
            }
            if(statusResponse) {
                users.splice(index, 1)
            }
        })
    }
    return
})

app.listen(process.env.PORT)