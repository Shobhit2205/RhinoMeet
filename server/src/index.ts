import { Server, Socket } from "socket.io";
import experss from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors'; 

const app = experss();
const server = http.createServer(app);
dotenv.config();

app.use(cors({
    origin: '*', // allow your frontend URLs
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

interface User {
    socketId: string;
}

let waitingUser: User | null = null;
const userPairs: Record<string, string> = {};

const matchUser = (socket: any) => {
    if(waitingUser !== null){
        if(!socket.id) return;
        userPairs[socket.id] = waitingUser.socketId;
        userPairs[waitingUser.socketId] = socket.id;

        socket.emit("user:connect", waitingUser.socketId);

        // io.to(waitingUser.socketId).emit("user:connect", socket.id);

        waitingUser = null;

    }
    else{
        waitingUser = {socketId: socket.id};
        console.log(`${socket.id} is waiting for pair`);
    }
}

io.on('connection', (socket) => {
    console.log(`Socket connected ${socket.id}`);

    matchUser(socket);

    // socket.on("user:connect", ({remoteId}) => {
    //     console.log("user:connect backend");
    //     io.to(remoteId).emit("user:connect", {remoteId: socket.id});
    // })

    socket.on("offer", ({offer, to}) => {
        console.log(`Recieved Offer from ${socket.id} to ${to}`);
        io.to(to).emit("offer", {offer, from: socket.id});
    });

    socket.on("answer", ({answer, to}) => {
        console.log(`Recieved answer from ${socket.id} to ${to}`);
        io.to(to).emit("answer", {answer, from: socket.id});
    })

    socket.on("peer:nego:needed", ({offer, to}) => {
        console.log("nego needed")
        io.to(to).emit("peer:nego:needed", { offer, from: socket.id });
    });

    socket.on("peer:nego:done", ({answer, to}) => {
        console.log("nego done")
        io.to(to).emit("peer:nego:final", {answer, to: socket.id});
    });

    socket.on('ice-candidate', ({ candidate, to }) => {
        console.log(`Relaying ICE candidate to ${to}`);
        io.to(to).emit('ice-candidate', { candidate });
    });

    socket.on("send:message", ({message, to}) => {
        console.log(message, to);
        io.to(to).emit("message:recieved", {message, from: socket.id});
    });

    socket.on("skip", () => {
        console.log(`${socket.id} skipped the current pair`);
        
        
        const partnerId = userPairs[socket.id];
        console.log(partnerId);
        console.log(socket.id);
        if (partnerId) {
            io.to(partnerId).emit("skipped");
            delete userPairs[socket.id];
            delete userPairs[partnerId];

            // Mark both users as waiting
            matchUser(io.sockets.sockets.get(partnerId));
        }

        // Mark the current socket as waiting
        matchUser(socket);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected ${socket.id}`);

        const partnerId = userPairs[socket.id];
        console.log(partnerId);
        console.log(socket.id);
        if(partnerId){
            io.to(partnerId).emit("partnerDisconnected");
            delete userPairs[socket.id];
            delete userPairs[partnerId];
            matchUser(io.sockets.sockets.get(partnerId));
        }

        if(waitingUser?.socketId == socket.id){
            waitingUser = null;
        }
       
    })
})

app.get('/', (req, res) => {
    console.log(`Server is running...`);
    res.send("Server is running...")
})


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
