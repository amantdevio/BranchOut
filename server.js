import 'dotenv/config.js'
import express from 'express';
import http from 'http';
import {Server} from 'socket.io'
import userRoutes from './routes/authRoutes.js'
import { handleSocket } from './controllers/socketController.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static("public"));

app.use('/api/auth',userRoutes);

handleSocket(io)

const PORT = process.env.PORT || 3000;
server.listen(PORT,'0.0.0.0',()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})