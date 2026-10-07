const express=require('express');
const {read,write,id,now}=require('../data/db');
const {protect}=require('../middleware/authMiddleware');
const router=express.Router();
function decorate(p){const u=read('users').find(x=>x.id===p.reportedBy); return {...p,reportedBy:u?{id:u.id,name:u.name,email:u.email}:null};}
router.get('/',(req,res)=>{
  const q=String(req.query.q||'').toLowerCase().trim(); let list=read('problems');
  if(q) list=list.filter(p=>[p.title,p.description,p.location,p.category,p.status].some(v=>String(v).toLowerCase().includes(q)));
  res.json(list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(decorate));
});
router.get('/:id',(req,res)=>{const p=read('problems').find(x=>x.id===req.params.id); if(!p)return res.status(404).json({message:'Problem not found.'});res.json(decorate(p));});
router.post('/',protect,(req,res)=>{
  const {title,description,category,location,image}=req.body;
  if(!title||!description||!category||!location)return res.status(400).json({message:'Please fill all required fields.'});
  const p={id:id(),title:String(title).trim(),description:String(description).trim(),category,location:String(location).trim(),image:image||'',status:'Reported',likes:0,reportedBy:req.user.id,createdAt:now()};
  const list=read('problems');list.push(p);write('problems',list);res.status(201).json({message:'Problem reported successfully.',problem:decorate(p)});
});
router.put('/:id/like',(req,res)=>{const list=read('problems'),p=list.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({message:'Problem not found.'});p.likes=(p.likes||0)+1;write('problems',list);res.json({likes:p.likes});});
router.put('/:id/status',protect,(req,res)=>{if(req.user.role!=='admin')return res.status(403).json({message:'Admin access required.'});const {status}=req.body;if(!['Reported','In Progress','Resolved'].includes(status))return res.status(400).json({message:'Invalid status.'});const list=read('problems'),p=list.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({message:'Problem not found.'});p.status=status;p.updatedAt=now();write('problems',list);res.json(decorate(p));});
router.delete('/:id',protect,(req,res)=>{const list=read('problems'),i=list.findIndex(x=>x.id===req.params.id);if(i<0)return res.status(404).json({message:'Problem not found.'});const p=list[i];if(req.user.role!=='admin'&&p.reportedBy!==req.user.id)return res.status(403).json({message:'Not allowed.'});list.splice(i,1);write('problems',list);res.json({message:'Problem deleted successfully.'});});
module.exports=router;
