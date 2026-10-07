const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dir = __dirname;
const files = { users:'users.json', problems:'problems.json', resources:'resources.json', comments:'comments.json' };

function ensure() {
  fs.mkdirSync(dir, { recursive:true });
  for (const file of Object.values(files)) {
    const p = path.join(dir,file);
    if (!fs.existsSync(p)) fs.writeFileSync(p, '[]');
  }
}
function read(type){ ensure(); return JSON.parse(fs.readFileSync(path.join(dir,files[type]),'utf8')); }
function write(type,data){ ensure(); fs.writeFileSync(path.join(dir,files[type]), JSON.stringify(data,null,2)); }
function id(){ return crypto.randomUUID(); }
function now(){ return new Date().toISOString(); }
function seed(){
  ensure();
  if(read('resources').length===0){
    write('resources',[
      {id:id(),title:'Government Hospital',description:'Public healthcare facility for general medical services and emergencies.',category:'Healthcare',location:'Local Area',contact:'108',website:'https://www.mohfw.gov.in/',addedBy:null,createdAt:now()},
      {id:id(),title:'Police Emergency',description:'For immediate police assistance and emergencies.',category:'Emergency',location:'Local Area',contact:'112',website:'https://112.gov.in/',addedBy:null,createdAt:now()},
      {id:id(),title:'Ambulance Service',description:'Emergency ambulance assistance.',category:'Emergency',location:'India',contact:'108',website:'https://www.mohfw.gov.in/',addedBy:null,createdAt:now()},
      {id:id(),title:'Municipal Civic Services',description:'Information and links for civic services and public complaints.',category:'Civic',location:'Local Area',contact:'',website:'https://www.india.gov.in/',addedBy:null,createdAt:now()}
    ]);
  }
}
module.exports={read,write,id,now,seed};
