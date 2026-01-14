const signUpForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');

// Helper function to handle button state 
function setButtonState(isSignup, isLoading){
    const prefix = isSignup ? "signup" : "login";
    const btn = document.getElementById(`${prefix}-submit-btn`);
    const text = document.getElementById(`${prefix}-btn-text`);
    const loader = document.getElementById(`${prefix}-btn-loader`);

    if(isLoading){
        text.style.display='none';
        loader.style.display='block';
        btn.disabled=true;
    }else{
        text.style.display='block';
        loader.style.display = 'none';
        btn.disabled = false;
    }
}


// ------Signup Form Logic------
if(signUpForm){
signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page from refreshing!

    setButtonState(true,true);//Start Loader

    // Get values from the inputs
    const formData = {
        student_id: document.getElementById('student_id').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        pseudonym: document.getElementById('pseudonym').value,
        branch: document.getElementById('branch').value,
        secret_code: document.getElementById('secret_code').value
    };

    // Send to your Node.js Backend
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
            
        if (response.ok) {
            let timeLeft=5;
            const timer= setInterval(()=>{
                timeLeft--;
                document.getElementById('success-content').style.display='flex'
                signUpForm.style.display='none';

                document.getElementById('form-container').style.overflow='hidden'
                const countdown=document.getElementById('countdown');
                countdown.innerHTML=timeLeft;
                if(timeLeft<=0){
                    clearInterval(timer)
                    window.location.href='login.html'
                }
            },1000);

        } else{
            const span=`<span class="message">*${result.message}.<span>`
            document.getElementById('msg-container').innerHTML=span;
            setButtonState(true,false); //Stop loading on error
        }
        } catch (err) {
            setButtonState(true,false);
            console.error("Error:", err);
        }
    });
}


// -----Login Form Logic-----
if(loginForm){
loginForm.addEventListener('submit',async (e)=>{
    e.preventDefault();

    setButtonState(false,true);//Start Loader

    const formData={
        student_id:document.getElementById("student_id").value,
        password:document.getElementById("password").value
    };

    try{
        const response = await fetch('/api/auth/login',{
            method: 'POST',
            headers: {'Content-Type': 'application/JSON'},
            body: JSON.stringify(formData)
        });

        const result= await response.json();

        if(response.ok){
            localStorage.setItem('token',result.token);
            window.location.href = 'chat.html';
        }else{
            setButtonState(false,false);
            const span=`<span class="message">*${result.message}.<span>`
            document.getElementById('msg-container').innerHTML=span;
        }
    } catch(err){
        setButtonState(false,false)
        console.error(err.message);
    }
});
}

const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector("#password");
const eyeIcon=document.querySelector("#eyeIcon");

togglePassword.addEventListener('click',()=>{
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute
    ('type',type);

    if(type === 'text'){
        eyeIcon.innerHTML = `<path d="M9.88 9.88L12 12m.12-2.12L10 12M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><path d="m2 2 20 20"/>`;
    }else{
        eyeIcon.innerHTML = `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`;
    }
})
