const jwt = require('jsonwebtoken');
const { read } = require('../data/db');
const SECRET = process.env.JWT_SECRET || 'community-platform-local-secret-change-me';
function protect(req,res,next){
  try{
    const header=req.headers.authorization||'';
    if(!header.startsWith('Bearer ')) return res.status(401).json({message:'Please login first.'});
    const decoded=jwt.verify(header.slice(7),SECRET);
    const user=read('users').find(u=>u.id===decoded.id);
    if(!user) return res.status(401).json({message:'User not found.'});
    const {password,...safe}=user; req.user=safe; next();
  }catch(e){res.status(401).json({message:'Invalid or expired token.'});}
}
function adminOnly(req,res,next){ if(req.user?.role!=='admin') return res.status(403).json({message:'Admin access required.'}); next(); }
module.exports={protect,adminOnly,SECRET};
