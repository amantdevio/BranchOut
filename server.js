import 'dotenv/config.js'
import express from 'express';
import http from 'http';
import {Server} from 'socket.io'
import userRoutes from './routes/authRoutes.js'
import { handleSocket } from './controllers/socketController.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.set('trust proxy', 1);
app.use((req, res, next) => {
    console.log("LOGGING REQUEST:", req.method, req.url);
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);

const io = new Server(server, {
    pingTimeout: 10000,
    pingInterval: 5000,
    transports:['websocket'],
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

io.engine.on("connection",(rawSocket)=>{
    rawSocket.request = null;
})

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/health',(req,res)=>{
    res.status(200).send("Server is healthy");
})

app.use('/api/auth',userRoutes);
app.use(express.static(path.join(__dirname,'public')));

handleSocket(io)

const PORT = process.env.PORT || 3000;
server.listen(PORT,'0.0.0.0',()=>{
    console.log(`Server running on port ${PORT}`);
})