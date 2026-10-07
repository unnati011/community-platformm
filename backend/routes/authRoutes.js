const express=require('express');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {read,write,id,now}=require('../data/db');
const {SECRET}=require('../middleware/authMiddleware');
const router=express.Router();
const safe=u=>{const {password,...x}=u;return x};
router.post('/register',async(req,res)=>{
  const {name,email,password,phone}=req.body;
  if(!name||!email||!password) return res.status(400).json({message:'Name, email and password are required.'});
  if(password.length<6) return res.status(400).json({message:'Password must be at least 6 characters.'});
  const users=read('users'), normalized=String(email).toLowerCase().trim();
  if(users.some(u=>u.email===normalized)) return res.status(400).json({message:'Email already registered.'});
  const adminEmail=(process.env.ADMIN_EMAIL||'admin@example.com').toLowerCase();
  const user={id:id(),name:String(name).trim(),email:normalized,password:await bcrypt.hash(password,10),phone:phone||'',role:normalized===adminEmail?'admin':'user',createdAt:now()};
  users.push(user);write('users',users);
  res.status(201).json({message:'Registration successful.',token:jwt.sign({id:user.id},SECRET,{expiresIn:'7d'}),user:safe(user)});
});
router.post('/login',async(req,res)=>{
  const email=String(req.body.email||'').toLowerCase().trim();
  const user=read('users').find(u=>u.email===email);
  if(!user||!(await bcrypt.compare(req.body.password||'',user.password))) return res.status(401).json({message:'Invalid email or password.'});
  res.json({message:'Login successful.',token:jwt.sign({id:user.id},SECRET,{expiresIn:'7d'}),user:safe(user)});
});
module.exports=router;
