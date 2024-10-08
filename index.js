require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
app.use(express.json());

require('./conn.js')
app.use('/user',require('./routes/User/user.js'))
app.use('/doctor',require('./routes/Doctor/doctor.js'))
app.use('/chat',require('./routes/AiBot/chat.js'))

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});
app.get('/chat/history', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chathistory.html'));
});
app.get('/signup',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', './User/registration.html'));
})
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', './User/login.html'));
})
app.get('/dashboard',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', './User/dashboard.html'));
})
app.get('/search',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', './User/appointment.html'));
})
app.get('/appoinment',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', './User/listappoinments.html'));
})
app.get('/doctor/dashboard',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public', './Doctor/dashboard.html'));
})

app.listen(process.env.PORT  || 5000,()=>{
    console.log('Server listening in 5000...');
    
})