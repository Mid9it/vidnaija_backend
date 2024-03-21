const jwt=require('jsonwebtoken')
const verifyJwtad=(req,res,next)=>{
const token=req.headers["auth-token"]

if (!token){return res.json({message:'Please Login',auth:false})}
else{
    try{
    const verify=jwt.verify(token,process.env.JWTT)
        req.user=verify;
            next()}
     catch(err){
         res.json({message:'Please Login',auth:false})
     }
        }
    }

module.exports=verifyJwtad