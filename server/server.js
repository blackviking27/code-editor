const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const Actions = require('./actions')
const next = require('next')

const PORT = process.env.PORT || 5000
const dev = process.env.NODE_ENV !== 'production'

const userSocketMap = {}

const app = express()
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler();

const server = http.createServer(app)
const io = new Server(server)

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId]
        }
    })
}

nextApp.prepare().then(() => {
    console.log("Inside the condition")

    io.on('connection', (socket) => {
        console.log("socket connected", socket.id)
        socket.on(Actions.JOIN, ({ roomId, username }) => {
            userSocketMap[socket.id] = username
            socket.join(roomId)
            const clients = getAllConnectedClients(roomId)
            clients.forEach(({ socketId }) => {
                io.to(socketId).emit(Actions.JOINED, {
                    clients,
                    username,
                    socketId: socket.id
                })
            })

        })

        socket.on(Actions.CODE_CHANGE, ({ roomId, code }) => {
            socket.in(roomId).emit(Actions.CODE_CHANGE, {
                code,
            })
        })

        socket.on(Actions.SYNC_CODE, ({ socketId, code }) => {
            io.to(socketId).emit(Actions.CODE_CHANGE, { code })
        })

        socket.on('disconnecting', () => {
            const rooms = [...socket.rooms]
            rooms.forEach((roomId) => {
                socket.in(roomId).emit(Actions.DISCONNECTED, {
                    socketId: socket.id,
                    username: userSocketMap[socket.id]

                })
            })
            delete userSocketMap[socket.id]
            socket.leave()
        })
    })

    app.all('*', (req, res) => nextHandler(req, res))

    server.listen(PORT, () => {
        console.log(`listening on ${PORT}`)
    })
}).catch(err => {
    console.log(err.stack)
    process.exit(1)
})