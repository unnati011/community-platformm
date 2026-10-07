const express=require('express');const cors=require('cors');const path=require('path');const dotenv=require('dotenv');const {seed}=require('./data/db');
dotenv.config();seed();
const app=express();app.use(cors());app.use(express.json({limit:'2mb'}));app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'..','frontend')));
app.get('/api/health',(req,res)=>res.json({success:true,message:'Community Platform API is running',storage:'local JSON'}));
app.use('/api/auth',require('./routes/authRoutes'));app.use('/api/problems',require('./routes/problemRoutes'));app.use('/api/resources',require('./routes/resourceRoutes'));app.use('/api/comments',require('./routes/commentRoutes'));
app.get('*',(req,res)=>{if(req.path.startsWith('/api/'))return res.status(404).json({message:'API route not found'});res.sendFile(path.join(__dirname,'..','frontend','index.html'));});
const PORT=process.env.PORT||5000;app.listen(PORT,()=>console.log(`Server running at http://localhost:${PORT}`));
