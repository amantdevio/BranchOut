const socket = io({
    transports:['websocket'],
    upgrade: false
});
let currentRoom=null;
const token= localStorage.getItem('token');
if(!token){
    window.location.href="login.html"
}

const username=JSON.parse(atob(token.split('.')[1]));

const myPseudonym =username.pseudonym;

const welcomeUser=document.getElementById('welcomeUser');

const findBtn=document.getElementById('find-btn');

const lobby=document.getElementById('lobby');
const loading = document.getElementById('loading');
const chatSection=document.getElementById('chat-section');
const msgBox=document.getElementById('messages');
const headingMsg=document.getElementById('heading');
const myNameDisplay=document.getElementById('my-name');
const input = document.getElementById('message-input');
const sendBtn=document.getElementById('send-btn');
const signOff=document.getElementById('signoff');
const typing=document.getElementById('typing');

const loaderNext=document.getElementById('loader-next');
const nextText=document.getElementById('next-text');

function scrollToBottom(){
    msgBox.scrollTop=msgBox.scrollHeight;
}

welcomeUser.innerHTML=`<span class="greeting" id="greeting">Welcome ${myPseudonym}</span>`;

if(myNameDisplay){
    myNameDisplay.innerText=myPseudonym;
}

// FIND PARTNER LOGIC-----
socket.on('online-update',(data)=>{
    const countElement=document.getElementById('online-count');
    if(countElement){
        countElement.innerHTML=`<div class="circle"></div>${data.count} Students Online`;
    }
})


document.getElementById('find-btn').addEventListener('click',()=>{
    loading.style.display='flex';
    findBtn.style.display='none'
    socket.emit('find-partner',{pseudonym:myPseudonym});
})

socket.on('force-logout',()=>{
    localStorage.removeItem('token');
    alert("Session moved to another tab/device. This tab will now close.");
    window.location.href="login.html";
})

socket.on('only-you',(data)=>{
    const connectingText = document.querySelector('.connecting');
    const busyMessage = document.getElementById('busy-message');
    const mainBusyMsg = document.getElementById('main-busy-msg');
    const loader = document.getElementById('loader');

    if (connectingText && busyMessage) {
        connectingText.style.display = 'none';
        busyMessage.style.display = 'block';
        mainBusyMsg.innerHTML = `${data.message}`;
        if (loader) {
            loader.style.borderTopColor = '#818cf8'; 
        }
        
    }
    if(chatSection.style.display==='flex'){
        const p = document.createElement('p');
        p.className = 'system';
        p.innerHTML=`${data.message}`;
        msgBox.appendChild(p);   
    }
    
})

socket.on('all-busy', (data) => {
    const connectingText = document.querySelector('.connecting');
    const busyMessage = document.getElementById('busy-message');
    const mainBusyMsg = document.getElementById('main-busy-msg');
    const loader = document.getElementById('loader');

    if (connectingText && busyMessage) {
        connectingText.style.display = 'none';
        busyMessage.style.display = 'block';
        mainBusyMsg.innerHTML = `${data.message}`;
        if (loader) {
            loader.style.borderTopColor = '#818cf8'; 
        }
    }

    if(chatSection.style.display==='flex'){
        const p = document.createElement('p');
        p.className = 'system';
        p.innerHTML=`${data.message}`;
        msgBox.appendChild(p);   
    }
});

socket.on('match-found',(data)=>{
    currentRoom=data.roomId;;
    loading.style.display='none';
    lobby.style.display='none';
    chatSection.style.display='flex';
    loaderNext.style.display='none';
    nextText.style.display='flex';
    myNameDisplay.innerText=myPseudonym;
    input.disabled=false;
    input.placeholder="Type a message...";
    
    if(data.isReconnection && data.history){
        msgBox.innerHTML='';
        data.history.forEach(msg => {
            if(msg.type==='system'){
                const p = document.createElement('p');
                p.className='system';
                p.innerText=msg.text;
                msgBox.appendChild(p);

                input.disabled=true;
                input.placeholder="Conversation Ended...";
            }else{
                const div = document.createElement('div');
                div.className=(msg.sender === myPseudonym)? "message-wrapper out" : "message-wrapper in";
                div.innerHTML = `<div class="bubble"><b>${msg.text}</b></div>`;
                msgBox.appendChild(div);
            }
        });
        if(data.roomId){
            msgBox.innerHTML += `<p class="system"><b>Notice:</b> Reconnected to ${data.partnerName}...</p>`;
        }
    }else{
        msgBox.innerHTML+=`<p class="system">Connected to ${data.partnerName}</p>`;
    }

    scrollToBottom();

    document.querySelector('.connecting').style.display= 'block';
    document.getElementById('busy-message').style.display = 'none';
})


//Messaging Logic-----
function sendMessage(){
    const text = input.value.trim();
    if(!text || !currentRoom) return;

    socket.emit('send-message',{
        roomId:currentRoom,
        message:text
    });

    const div =document.createElement('div');
    div.className = "message-wrapper out"
    div.innerHTML=`<div class="bubble"><b>${text}</b></div>`;
    msgBox.appendChild(div);

    input.value="";
    scrollToBottom();
}

sendBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    sendMessage();
});

input.addEventListener('keydown',(e)=>{
    if(e.key==="Enter"&& !e.shiftKey){
        e.preventDefault();
        sendMessage();
        typing.style.display='none';
    }
})



socket.on('recieve-message',(data)=>{
    const div= document.createElement('div');
    div.className = 'message-wrapper in'
    div.innerHTML=`<div class="bubble"><b>${data.text}</b></div>`;
    msgBox.appendChild(div);

    scrollToBottom();
});


//Termination Logic------
socket.on('partner-left',(data)=>{
    const p = document.createElement('p');
    p.className = 'system';


    const name=data.sender||"Partner"
    p.innerText = `${name} has left the conversation.`;
    msgBox.appendChild(p);

    input.disabled = true;
    input.placeholder = "Conversation Ended."

    scrollToBottom();
})

function resetToSearching(){
    msgBox.innerHTML='';
    document.getElementById('loader-next').style.display='flex';
    document.getElementById('next-text').style.display='none'

    input.disabled=false;
    input.placeholder = "Searching New Student...";
}

function escapeUser(){
    socket.emit('leave-room',currentRoom);

    resetToSearching();

    socket.emit('find-partner',{pseudonym:myPseudonym});

    currentRoom=null;

    msgBox.innerHTML=`<p class="system">Searching for someone new...</p>`;
    input.innerHTML='';
}

document.getElementById('next-btn').addEventListener('click',escapeUser);
input.addEventListener('keydown',(e)=>{
    if(e.key==="Escape"){
        e.preventDefault();
        escapeUser();
    }
})

document.getElementById('next-btn').addEventListener('keydown',(e)=>{
    const key = e.key;
    console.log(key);
})

signOff.addEventListener('click',()=>{
    localStorage.removeItem('token');
    window.location.href="login.html";
})

let typingTimeout;

const typingdiv=document.createElement('div');
        typingdiv.id='typing-status'
        typingdiv.className='message-wrapper in';
        typingdiv.style.display='none';
        typingdiv.innerHTML=`<div class="type-bubble typing-dots"><i>Typing...</i></div>`;

input.addEventListener('keydown',(e)=>{
    if(!currentRoom){
        return;
    }
    console.log(e.key)

    if(e.key){
    socket.emit('typing',{roomId:currentRoom, isTyping:true});
    }

    if(e.key==="Enter"){
    socket.emit('typing',{roomId:currentRoom, isTyping:false});
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(()=>{
        socket.emit('typing',{roomId: currentRoom, isTyping:false});
    },500);
});



socket.on('display-typing',(data)=>{
    if(data.isTyping){
        msgBox.appendChild(typingdiv)

        document.getElementById('typing-status').style.display='flex';
    }else{
        document.getElementById('typing-status').style.display='none';
    }
    scrollToBottom();
})

const container = document.querySelector('#picker-container');
const emojiBtn = document.querySelector('#emoji-btn');

let picker;
if(container && emojiBtn){
    picker = picmo.createPicker({
        rootElement: container,
        showSearch:true,
    });

    picker.addEventListener('emoji:select',event=>{
        input.value += event.emoji;
        container.style.display = 'none';
        input.focus();
    });
}

emojiBtn.addEventListener('click',(e)=>{
    e.stopPropagation();
    const isHidden = container.style.display === 'none';
    container.style.display = isHidden ? 'block' : 'none';
});

document.addEventListener('click',(e)=>{
    if(container&&!container.contains(e.target)&&e.target!=emojiBtn){
        container.style.display ='none';
    }

    
});



window.addEventListener('pageshow',(e)=>{
    if(e.persisted||(performance.getEntriesByType("navigation")[0] && performance.getEntriesByType("navigation")[0].type === 'back_forward')){
        window.location.reload();
    }
})
