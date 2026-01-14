let waitingQueue=[];
const activeChat = new Map();
const userSockets = new Map();

export const handleSocket=(io)=>{
    io.on('connection',(socket)=>{
        const syncCount = () =>{
            io.emit('online-update',{
                count:io.engine.clientsCount
            })
        }
          
        syncCount();
        
        socket.on('find-partner',(data)=>{
            const myName = data.pseudonym;
            socket.pseudonym = myName;
            
            // RECONNECTION LOGIC
            if(activeChat.has(myName)){
                const session = activeChat.get(myName);
                const oldSocketId = userSockets.get(myName);
                
                if(oldSocketId && oldSocketId !== socket.id){
                    io.to(oldSocketId).emit('force-logout');
                }
                
                socket.join(session.roomId);
                socket.currentRoom=session.roomId;
                
                socket.emit('match-found',{
                    roomId: session.roomId,
                    partnerName: session.partnerName,
                    isReconnection: true,
                    history: session.messages
                });
                return;
            }
            userSockets.set(myName, socket.id);

// 2. State Calculations
    const othersOnline = io.engine.clientsCount - 1;
    const peopleInChats = activeChat.size;
    const availableOthers = othersOnline - peopleInChats;

    // 3. Conditional Messaging
    if (othersOnline === 0) {
        socket.emit('only-you', {
            message: "You're the only one here! BranchOut will connect you as soon as the next student arrives."
        });
    } 
    else if (availableOthers === 0 && waitingQueue.length === 0) {
        socket.emit('all-busy', {
            message: "Every student is currently connected. You're next in line!"
        });
    }
        
            // MATCHMACHING LOGIC
            if(waitingQueue.length>0){
                const partner=waitingQueue.shift();

                if(partner.pseudonym===myName){
                    waitingQueue.push(socket);
                    return;
                }

                const roomId=`room_${socket.id}_${partner.id}`;

                socket.join(roomId);
                partner.join(roomId);

                socket.currentRoom=roomId;
                partner.currentRoom=roomId;

                activeChat.set(myName, {roomId,partnerName: partner.pseudonym, messages: []});
                activeChat.set(partner.pseudonym, {roomId,partnerName: myName, messages:[]});

                socket.emit('match-found',{
                    roomId:roomId,
                    partnerName:partner.pseudonym
                });

                partner.emit('match-found',{roomId:roomId,partnerName:socket.pseudonym});
            }else{
                waitingQueue.push(socket);
                socket.emit('status','Searching...');
            }
        });

        socket.on('leave-room',(roomId)=>{
            const myName = socket.pseudonym;
            const session = activeChat.get(myName);
            if(session){
                const partnerName = session.partnerName;
                const partnerSession = activeChat.get(partnerName);

                if(partnerSession){
                    partnerSession.messages.push({
                        text:`${myName} has left the conversation.`,
                        type:'system'
                    });
                }
                activeChat.delete(myName);
                activeChat.delete(partnerName);
            }
            socket.to(roomId).emit('partner-left',{
                sender:myName
            });

            socket.leave(roomId);
            socket.currentRoom=null;
        });

        socket.on('send-message',({roomId,message})=>{
            const myName =  socket.pseudonym;
            const mySession = activeChat.get(myName);
            
            const sanitzedMessage = message.replace(/<[^>]*>?/gm, '');
            if(mySession){
                const msgObj={text:message,sender:myName, type:'chat'};

                mySession.messages.push(msgObj);

                if(mySession.messages.length>50)mySession.messages.shift();
                const partnerSession = activeChat.get(mySession.partnerName);

                if(partnerSession){
                    partnerSession.messages.push(msgObj);
                    if(partnerSession.messages.length>50) partnerSession.messages.shift();
                }
            }
            socket.to(roomId).emit("recieve-message",{
                text:sanitzedMessage,
                sender:socket.pseudonym
            });
        });

        socket.on('disconnect',()=>{   
            const myName = socket.pseudonym;
            if(myName){
                if(userSockets.get(myName)===socket.id){
                    userSockets.delete(myName);
                }
            }             
            waitingQueue=waitingQueue.filter(s=>s.id != socket.id);

            syncCount();
        });

        socket.on('typing',({roomId,isTyping})=>{
            socket.to(roomId).emit('display-typing',{
                isTyping,
                sender: socket.pseudonym
            })
        })
        
    });
};