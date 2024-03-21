const {  user, movies, upcoming } = require("../Schema/schema.js");
const JWT = require('jsonwebtoken') 
const bcrypt = require('bcrypt');
const verifyEmail = require('./email.js');



const getMovies = async(req,res)=>{
    try{
    
    const data = await movies.find({})
   
    return  res.json(data)
    }
    catch(err){
        console.log(err)
    }
}

const Searchmovie = async(req, res)=>{
    try{
    const lette = req.params.searchmov
    const letter = lette.trim()
    if(letter == "")
    {
    
        return res.json({data:[],auth:true})
    }
    
        const result = await movies.find({ title:{'$regex':`${letter}`, $options: 'i'}}).limit(5)
        const modifiedResult = result.map(movie => ({ title: movie.title, _id: movie._id , series:movie.series}));
        res.json({data:modifiedResult, auth:true})
    }
    catch(e){
        console.log(e)

    }
}
const homemovie = async(req, res)=>{
    try{
    const lette = req.params.search
    const letter = lette.trim()
    if(letter == "")
    {
    
        return res.json({data:[],auth:true})
    }
   
        const result = await movies.find({ title:{'$regex':`${letter}`, $options: 'i'}}).limit(5)
        const modifiedResult = result.map(movie => ({ title: movie.title, _id: movie._id }));
        res.json({data:modifiedResult, auth:true})
    }
    catch(e){
        console.log(e)

    }
}
const Search = async(req, res)=>{
    try{
    const lette = req.params.search
    const cate = req?.query?.cate?.toUpperCase()
    const type = req?.query?.type?.toUpperCase()
    const limit = req.query.limit
    const start = req.query.start
    const letter = lette.trim()
    if(letter == "")
    {
    
        return res.json({data:[],auth:true})
    }
    
         if(cate != "ASIANSERIES" && cate != "ANIME" && cate != "TVSHOWS" && cate != "MOVIES"){
           
        const resu = await movies.find({ title:{'$regex':`${letter}`, $options: 'i'}, $or: [
            {"type.a": type},
            {"type.b": type},
            {"type.c": type}
          ]})
          const result = resu.reverse()
          const info = result.slice(start, limit)
        res.json({info:info, auth:true, length:result.length})
         }
         else if(cate == "MOVIES")
         {
            const resu = await movies.find({ title:{'$regex':`${letter}`, $options: 'i'}, series:false})
            const result = resu.reverse()
            const info = result.slice(start, limit)
            res.json({info:info, auth:true, length:result.length})
         }
         else{
            
            const resu = await movies.find({ title:{'$regex':`${letter}`, $options: 'i'},  category:cate.toLowerCase()})
            const result = resu.reverse()
            const info = result.slice(start, limit)
            res.json({info:info, auth:true, length:result.length})
         }
    }
    catch(e){
        console.log(e)

    }
}
const getMoviescate = async(req,res)=>{
    try{
    const datah = await movies.find({category:"hollywood",series:false})
    const hollywood = datah.reverse().slice(0, 6)
    const datab= await movies.find({category:"bollywood",series:false})
    const bollywood = datab.reverse().slice(0, 6)
    const datatop = await movies.find({top:true}).sort({"updatedAt": -1}).limit(3)
    const top = datatop.reverse().slice(0,3)
    const trailer = await upcoming.find({})
    const asian = await movies.find({category:"asianseries"}).sort({"updatedAt": -1}).limit(5)
    const animes = await movies.find({category:"anime"}).sort({"updatedAt": -1}).limit(6)
    const tv = await movies.find({category:"tvshows"}).sort({"updatedAt": -1}).limit(6)
    const latest= await movies.find({category:"anime"})
    const late = latest[latest.length - 1]
    const newest = animes
    let dataa = animes
    
    let tvshows = tv
    
    let datak = asian
    
    return res.json({hollywood,bollywood,tvshows,top,datak, dataa,trailer, newest,late})
    }
    catch(err){
        console.log(err)
    }
}

const userData = async(req, res)=>{
    const pass = req.body.password
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(pass, salt)
    const email = req.body.email.toUpperCase()
    const useraccount = await user.find({email:email})
    const username = await user.find({user_name:req.body.user_name})
    if(req.body.password !== req.body.comfirmpassword)
    {
        return res.json({create:false, message:"Password Does not Match"})
    }
    if(useraccount.length > 0)
    {
        return res.json({create:false,message:"Email Already Exist"})
    }
    
    if(username.length > 0)
    {
        return res.json({create:false,message:"Username Already Exist"})
    }
    try{    
    const data = await user.create({
            user_name:req.body.user_name,
            rank:1,
            email:email,
            admin:false,
            password:hash,
            group_access:true,
            profile_image:"1",
            notification:{
                notify:{
                    message:"🌟 Welcome to the Movie community! Dive into discussions, share your passion, and make yourself at home. Enjoy your stay! 🚀",
                },
                alarm:true},
            suspend:true,
            ban:false,
            videos:[]
        })
         await data.save()
         const emailtoken = JWT.sign({email}, process.env.EMI, { expiresIn: '1h' })
         verifyEmail.verifyEmail({
            userEmail: email,
            token: emailtoken
          })
         return res.json({create:true, message:"Activation Link Sent To Your Email"})
    }
        catch(e)
        {
            
            console.log(e)
        }
    
}

const verifyemailtoken = async (req, res)=>{
    const token = req.params.token
    
    try{
        const verifyWithJWTS = JWT.verify(token, process.env.EMI);
         await user.findOneAndUpdate({email: verifyWithJWTS.email},{
            $set:{
                suspend:false
            }
        })
        return res.json({auth:true, mgs:"Email verified"})
    }
    catch(e){
        return res.json({auth:true, mgs:"Authentication Error, Sign Up Again"})
    } 
   

} 
const check = async (req, res) => {
    try {
        const id = req.params.id;
        const info = await user.findOne({ _id: id });

        if (info == null) {
            return res.json({ auth: false, message: "Email Not Found" });
        }

        if (info.admin) {
            res.json({ auth: true });
        } else {
            res.json({ auth: false });
        }
    } catch (error) {
        console.error("Error in check function:", error);
        res.status(500).json({ auth: false, message: "Internal Server Error" });
    }
};

const pushUsers = async(req,res)=>{
    try{const id = req.params.id
    const name = await user.findOne({_id:id})
    if(name.user_name == req.body.user_name)
    {
    await user.findByIdAndUpdate({_id:id},{
        profile_image:req.body.profile_image,
        user_name:req.body.user_name
    })
    return res.json({update:true})
}
else{
    const usernam = await user.find({ user_name:req.body.user_name})
    if(usernam.length > 0)
    { return res.json({update:false, mgs:"Username Already Exist"})}
    else{
        await user.findByIdAndUpdate({_id:id},{
            profile_image:req.body.profile_image,
            user_name:req.body.user_name
        })
        return res.json({update:true})
    }
}
}
catch(e){
    console.log(e)
}}

const notify = async(req,res)=>{
    try{
     const id = req.params.id
     const data = await user.findOne({_id:id})
     const notice = data.notification
     if(notice.alarm)
     {
     await user.findByIdAndUpdate({_id:id},{
         $set:{
             "notification.alarm":false
             
         }
         
     })}
     return res.json({mgs:notice, auth:true
     })
    }
    catch(e)
    {
     console.log(e)
    }
 }

const changePass = async (req,res) =>{
    try{
    const cpass = req.body.cpassword
    const npass = req.body.npassword
    const copass = req.body.copassword
    const id = req.params.id
    const info = await user.findOne({_id:id})
    if(copass !== npass)
    {
        return res.json({mgs:"New Password and Comfirm Password dont match", update:false})
    }
    if(cpass == npass)
    {
        return res.json({mgs:"New Password and Current Password can't be the same", update:false})
    }
     
    const result = await bcrypt.compare(cpass, info.password)
        if(result)
        {
        const pass = req.body.npassword
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(pass, salt)
        await user.findByIdAndUpdate({_id:id},{
            password:hash,
        })
        
        return res.json({update:true})
    }
        else{
            res.json({mgs:"Current Password Wrong", update:false})
        }
    }
    catch(e){
        console.log(e)
    }
}
    

const loginIn = async(req, res) =>{
    try{
    const emailinfo = req.body.email.toUpperCase()
    const info = await user.findOne({email:emailinfo})
    if(info == null){
        return res.json({auth:false,message:"Email Not Found"})
    }
    const result = await bcrypt.compare(req.body.password, info.password)
    if (result)
    {
        if(info?.suspend){
            return res.json({auth:false,message:"Please Verify Email First"})
        }
        const id = info._id
        const token = JWT.sign({id}, process.env.JWTS)
        const userdata = {user_name:info.user_name, _id:info._id, admin:info.admin, group_access:info.group_access, profile_image:info.profile_image, rank:info.rank, notification:info.notification, suspend:info.suspend, ban:info.ban}
        return res.json({auth:true, token:token, data:userdata})
    }
    else{
        return res.json({auth:false, message:'Password Wrong'})
    }
    }
    catch(e)
    {
        console.log(e)
    }
    
}

const getUser = async (req, res) => {
    
        try {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // One hour ago
          await user.deleteMany({
            suspend: true,
            createdAt: { $lt: oneHourAgo },
          });
          
        } catch (error) {
          console.error('Error deleting unverified users:', error);
        }
     
    const id = req.params.id;

    try {
        // Fetch the user information
        const info = await user.findOne({ _id: id });
        if(!info){
            return res.json({auth:false})
    }
        // Check if the account was created more than one month ago
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // Check if the account was created more than three months ago
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // Check if the account was created more than six months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Check if the account was created more than one year ago
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        // Check if the account was created more than one year and eight months ago
        const oneYearEightMonthsAgo = new Date();
        oneYearEightMonthsAgo.setFullYear(oneYearEightMonthsAgo.getFullYear() - 1);
        oneYearEightMonthsAgo.setMonth(oneYearEightMonthsAgo.getMonth() - 8);

        // Check if the account was created more than three years ago
        const threeYearsAgo = new Date();
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

        if (info?.createdAt <= oneMonthAgo  && !(info.createdAt < threeMonthsAgo)) {
            // Account was created more than one month ago, update rank to 10
            info.rank = 10;
            await info.save();
           
        } else if (info.createdAt <= threeMonthsAgo && !(info.createdAt < sixMonthsAgo)) {
            // Account was created more than three months ago, update rank to 30
            info.rank = 30;
            await info.save();
           
        } else if (info.createdAt <= sixMonthsAgo && !(info.createdAt < oneYearAgo)) {
            // Account was created more than six months ago, update rank to 80
            info.rank = 80;
            await info.save();
            
        } else if (info.createdAt <= oneYearAgo && !(info.createdAt < oneYearEightMonthsAgo)) {
            // Account was created more than one year ago, update rank to 150
            info.rank = 150;
            await info.save();
            
        } else if (info.createdAt <= oneYearEightMonthsAgo && !(info.createdAt < threeYearsAgo)) {
            // Account was created more than one year and eight months ago, update rank to 300
            info.rank = 300;
            await info.save();
            
        } else if (info.createdAt <= threeYearsAgo) {
            // Account was created more than three years ago, update rank to 500
            info.rank = 500;
            await info.save();

        }
        else{
            info.rank = 1
            await info.save()
        }

        // Prepare the response object
        const result = {
            user_name: info.user_name,
            email: info.email,
            profile_image: info.profile_image,
            rank: info.rank,
            videos: info.videos,
            notification: info.notification.alarm,
            _id: info._id,
        };

        return res.json({data:result, auth:true});
    } catch (e) {
        console.log(e);
        // Handle the error appropriately
    }
};


const passchange = async(req, res)=>{
    try{
    const email = req.body.email.toUpperCase()
    const data = await user.findOne({email: email})
    if (data)
    {
        const emailtoken = JWT.sign({email}, process.env.CHAP, { expiresIn: '1h' })
        verifyEmail.verifyPass({
           userEmail: email,
           token: emailtoken
         })
        return res.json({auth:true, mgs:"Activation Link Sent To Your Email"})
    }
    else{
        return res.json({auth:false, mgs:"Email Doesnt Exist"})
    }
}catch(e){
    console.log(e)
}
}

const passwordchange = async(req, res)=>{
    const token = req.body.token
    const comfirmpassword = req.body.copassword
    const password = req.body.npassword
    if (comfirmpassword !== password)
    {
        return res.json({auth:true, mgs:"Passwords Not the Same"})
    }
    try{
    const verifyWithJWTS = JWT.verify(token, process.env.CHAP);
    const data = await user.findOne({email: verifyWithJWTS.email})
    const result = await bcrypt.compare(password, data.password)
    if(result)
    {
        return res.json({auth:true, mgs:"Can't Change To Current Password"})
    }
    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(password, salt)
    await user.findOneAndUpdate({email: verifyWithJWTS.email},{
        $set:{
            password:hash
        }
    })
    return res.json({auth:true, mgs:"Password Changed"})

    }
    catch(e){
        return res.json({auth:true, mgs:"Link Authentication Failed"})
    }
}


const pushMovie = async (req, res) => {
    try{
        if(!req.body.series){
    const post = await movies.create({
        title:req.body.title,
        rating:req.body.rating,
        year:req.body.year,
        type:req.body.type,
        runtime:req.body.runtime,
        rated:req.body.rated,
        release:req.body.release,
        image:req.body.image,
        overview:req.body.overview,
        comment:[],
        lowdownload:{size:req.body.lowdownload.size,link:req.body.lowdownload.link},
        highdownload:{size:req.body.highdownload.size,link:req.body.highdownload.link},
        trailer:req.body.trailer,
        category:req.body.category,
        top:false,
        series:req.body.series,
    })
    await post.save()
    return res.json('successful')
}
else{
    const post = await movies.create({
        title:req.body.title,
        rating:req.body.rating,
        year:req.body.year,
        type:req.body.type,
        runtime:req.body.runtime,
        rated:req.body.rated,
        release:req.body.release,
        image:req.body.image,
        overview:req.body.overview,
        comment:[],
        trailer:req.body.trailer,
        category:req.body.category,
        top:false,
        series:req.body.series,
        seasons:req.body.seasons
    })
    await post.save()
    return res.json('successful')
}
    }
    catch(e)
    {
        console.log(e)
    }
}
const editMovie = async (req, res) => {
    try {
      
      const existingMovie = await movies.findByIdAndUpdate(req.params.id,{
            $set:{
                title : req.body.title,
                rating : req.body.rating,
                year : req.body.year,
                type : req.body.type,
                runtime : req.body.runtime,
                rated : req.body.rated,
                release : req.body.release,
                image : req.body.image,
                overview : req.body.overview,
                lowdownload : {
                  size: req.body.lowdownload.size,
                  link: req.body.lowdownload.link,
                },
                highdownload : {
                  size: req.body.highdownload.size,
                  link: req.body.highdownload.link,
                },
                trailer : req.body.trailer,
                category : req.body.category,
                top : req.body.top,
                series : req.body.series,
               
            }
      },
      { new: true } );
  
      if (!existingMovie) {
        return res.status(404).json({ error: 'Movie not found', auth:false });
      }
      return res.json({mgs:true});
    } catch (e) {
      return res.status(500).json({ error: 'Internal Server Error', auth:false });
    }
  };
  
  
  const pushSeries = async (req, res) => {
 
    try {
        if (req.body.series) {
            const filter = { _id: req.params.id }; // Assuming _id is passed in the request body

            const update = {
                $set:
                {title: req.body.title,
                rating: req.body.rating,
                year: req.body.year,
                type: req.body.type,
                runtime: req.body.runtime,
                rated: req.body.rated,
                release: req.body.release,
                image: req.body.image,
                overview: req.body.overview,
                trailer: req.body.trailer,
                category: req.body.category,
                top: false,
                seasons : req.body.seasons,
                series: req.body.series}
            };
            const options = { upsert: true, new: true, setDefaultsOnInsert: true };

            const updatedPost = await movies.findOneAndUpdate(filter, update, options);
            if (!updatedPost) {
                return res.status(404).json({ error: 'Movie not found', auth:false });
              }

            res.json({mgs:true});
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' , auth:false});
    }
};


const findMovie = async (req, res) =>{
    try{
    const limit = req.query.limit
    const start = req.query.start
    const id = req.params.id
    const data = await movies.findOne({_id:id})
    if(!data)
    {
        return res.json({auth:false})
    }
    const comm = data.comment.slice(start,limit)

    const infolength = data.comment.length

    if(data.series)
    {
    const info = {
        top:data.top,
        trailer:data.trailer,
        category:data.category,
        series:data.series,
        seasons:data.seasons,
        data:data.data,
        _id:data._id,
        title:data.title,
        rating:data.rating,
        year: data.year,
        type:data.type,
        runtime:data.runtime,
        rated:data.rated,
        release:data.release,
        image:data.image,
        overview:data.overview,
        comment:comm,
        length:infolength,
    }
        return res.json(info)
}
else{
    const info = {
        top:data.top,
        lowdownload:data.lowdownload,
        highdownload:data.highdownload,
        trailer:data.trailer,
        category:data.category,
        data:data.data,
        _id:data._id,
        title:data.title,
        rating:data.rating,
        year: data.year,
        type:data.type,
        runtime:data.runtime,
        rated:data.rated,
        release:data.release,
        image:data.image,
        overview:data.overview,
        comment:comm,
        length:infolength
    }
        return res.json(info)
}
    }
    catch(e)
    {
       return res.json({auth:false})
    }

}


const findMovies = async (req, res) =>{
    try{
    const limit = req.query.limit
    const start = req.query.start
    const season = req.query.season
    const id = req.params.id
    const data = await movies.findOne({_id:id})
    const number = data.seasons.length
    const limi = data.seasons[season - 1]
    const comm = data.comment.slice(start,limit)

                    // Fetch user information for each comment and reply
                    for (const comment of comm) {
                        const userId = comment.id_user;
                        const userInfo = await user.findOne({ _id: userId });
            
                        // Update comment information with user data
                        if (userInfo) {
                            comment.name = userInfo.user_name;
                            comment.profile_image = userInfo.profile_image;
                            comment.rank = userInfo.rank;
                        }
            
                        // Fetch user information for each reply
                        for (const reply of comment.reply || []) {
                            const replyUserId = reply.id_user;
                            const replyUserInfo = await user.findOne({ _id: replyUserId });
            
                            // Update reply information with user data
                            if (replyUserInfo) {
                                reply.name = replyUserInfo.user_name;
                                reply.profile_image = replyUserInfo.profile_image;
                                reply.rank = replyUserInfo.rank;
                            }
                        }
                    }
    const infolength = data.comment.length

    if(data.series)
    {
    const info = {
        top:data.top,
        trailer:data.trailer,
        category:data.category,
        series:data.series,
        seasons:limi,
        data:data.data,
        _id:data._id,
        title:data.title,
        rating:data.rating,
        year: data.year,
        type:data.type,
        runtime:data.runtime,
        rated:data.rated,
        release:data.release,
        image:data.image,
        overview:data.overview,
        comment:comm,
        length:infolength,
        number
    }
        return res.json(info)
}
else{
    const info = {
        top:data.top,
        lowdownload:data.lowdownload,
        highdownload:data.highdownload,
        trailer:data.trailer,
        category:data.category,
        data:data.data,
        _id:data._id,
        title:data.title,
        rating:data.rating,
        year: data.year,
        type:data.type,
        runtime:data.runtime,
        rated:data.rated,
        release:data.release,
        image:data.image,
        overview:data.overview,
        comment:comm,
        length:infolength
    }
        return res.json(info)
}
    }
    catch(e)
    {
        return res.json(false)
    }

}

const deletemovie =async(req, res)=>{
    try{
    const id = req.params.id
    await movies.deleteOne({_id:id})
    
        res.json({delete:true})
}
    catch(e){
        console.log(e)
    }

}

const listMovies = async (req, res) =>{
    const id = req.params.category.toUpperCase()
    const limit = req.query.limit
    const start = req.query.start
    if (id != "MOVIES" && id != "ASIANSERIES" && id != "ANIME" && id != "TVSHOWS")
    {
        try{
        const data = await movies.find({
        $or: [
          {"type.a": id},
          {"type.b": id},
          {"type.c": id}
        ],series:false
      })
    
        const length = data.length
        if(length < 1)
        {
            return res.json(false)
        }
        const info = data.reverse().slice(start, limit)
        return res.json({info:info,length:length})
    }catch(e){
        return res.json({auth:false})
    }}
    else if(id == "MOVIES"){
        try{
        const data = await movies.find({series:false
          })
         
            const length = data.length
            const info = data.reverse().slice(start, limit)
            return  res.json({info:info,length:length})
        }catch(e){
            console.log(e)
        }
    }
    else if(id == "ASIANSERIES")
    {
        try{
        const data = await movies.find({category:"asianseries",series:true})
       
          const length = data.length
          const info = data.reverse().slice(start, limit)
          return res.json({info:info,length:length})
      }catch(e){
        console.log(e)
      }
    }
    else if(id == "TVSHOWS")
    {
        try{
        const data = await movies.find({category:"tvshows",series:true})
       
          const length = data.length
          const info = data.reverse().slice(start, limit)
          return res.json({info:info,length:length})
      }catch(e){
        console.log(e)
      }
    }
    else if(id == "ANIME"){
        try{
        const data = await movies.find({category:"anime",series:true})
          const length = data.length
          const info = data.reverse().slice(start, limit)
         
          return res.json({info:info,length:length})
      }catch(e){
        console.log(e)
      }
    }
    else{
        return res.json({auth:false})
    }
}

const upcomingPush = async(req, res)=>{
    try{
        const data = await upcoming.find({})
        if(data.length > 0)
        {
           
        const id = data[0]._id
        if(data.length > 6)
        {
            await upcoming.deleteOne({_id:id})
        }}
        const pushs = await upcoming.create({
            title:req.body.title,
            image:req.body.image,
            src:req.body.src
        })
        await pushs.save()
        res.json({mgs:true})
    }
    catch(e){
        console.log(e)
    }
}



const postComment = async(req, res) =>{
   
    try{
    const comments = req.body.comment
    const id = req.params.id
    const users = await user.findOne({_id:req.body.comment.id_user})
    if(!users)
    {
        return res.json({ auth:false})
    }
    if(comments.re)
    {
    const data = await movies.findByIdAndUpdate({_id:id},{
        $push:{
            "comment":{
                chat:comments.chat,
                name:users.user_name,
                id_user:users._id,
                profile_image:users.profile_image,
                reaction:0,
                rank:users.rank,
                re:true
            }
        }
    },
    {
      timestamps: false, // Disable automatic timestamps
    })
    const inf = data.comment.length
    return res.json({no:inf + 1, auth:true})
}else{

    const data = await movies.findOneAndUpdate(
        {
          _id: id,
          "comment._id": req.body.comment.id, // Ensures that the reply does not already exist
          "comment.reply": { $exists: true, $not: { $elemMatch: { $exists: true } } },
        },
        {
          $push: {
            "comment.$.reply": {
              chat: comments.chat,
              name: users.user_name,
              id_user: users._id,
              profile_image: users.profile_image,
              reaction: 0,
              rank: users.rank,
              re: false,
            },
          },
        },
        { new: true,timestamps: false }
      );
      if(data)
      {
    const inf = data?.comment?.length
    return res.json({no:inf + 1, auth:true})
      }
      else{
        const inf = data?.comment?.length
        return res.json({no:inf, auth:true})
      }

}
    }
    catch(e)
    {
        console.log(e)
    }

}


const deleteComment = async(req, res)=>{
   try{
    const id = req.params.id
    const user = req.query.ids
    const movie = await movies.findOne({ "comment._id": id });
    if (!movie) {
        return res.status(404).json({ message: "Reply not found" });
    }

    const commentIndex = movie.comment.findIndex(comment =>
        comment._id.toString() == id
    );
    if(movie.comment[commentIndex].id_user !== user)
    {
        return  res.status(200).json({ message: true });
    }
    await movies.findOneAndUpdate({"comment._id":id},
    { $pull: { comment: { _id: id } } },
    {
      timestamps: false, // Disable automatic timestamps
    })

    
        res.status(200).json({ message: true });
   
   }
   catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
}
}

const deleteoneComment = async(req, res)=>{
    
    try{
     const id = req.params.id
     const user = req.query.ids
     const movie = await movies.findOne({  "comment.reply._id": id});
     if (!movie) {
         return res.status(404).json({ message: "Reply not found" });
     }
     const commentIndex = movie.comment.findIndex(comment =>
        comment.reply.some(reply => reply._id.toString() === id)
    );
   
    const replyIndex = movie.comment[commentIndex].reply.findIndex(reply =>
        reply._id.toString() === id
    );
 
    const info =  movie.comment[commentIndex].reply[replyIndex]
   
    if(info.id_user !== user)
    {
    return res.status(200).json({ message: true });
    }

     await movies.findOneAndUpdate({"comment.reply._id":id},
     { $pull: { "comment.$.reply": { _id: id } } },
     {
       timestamps: false, // Disable automatic timestamps
     })
 
        
         res.status(200).json({ message: true });
    
    }
    catch (error) {
     console.error("Error deleting comment:", error);
     res.status(500).json({ message: "Internal Server Error" });
 }
 }

const loginInAd = async(req, res)=>{
   
    try{
        const emailinfo = req.body.email.toUpperCase()
        const info = await user.findOne({email:emailinfo})
        if(info == null){
            return res.json({auth:false,message:"Email Not Found"})
        }

        if(!info.admin)
        {
            return res.json({auth:false, message:"Dont have Access"})
        }
        const result = await bcrypt.compare(req.body.password, info.password)
        if (result)
        {
            const id = info._id
            const token = JWT.sign({id}, process.env.JWTT)
            const userdata = {user_name:info.user_name, _id:info._id, admin:info.admin, group_access:info.group_access, profile_image:info.profile_image, rank:info.rank, notification:info.notification, suspend:info.suspend, ban:info.ban}
            return res.json({auth:true, token:token, data:userdata})
        }
        else{
            return res.json({auth:false, message:'Password Wrong'})
        }
        }
        catch(e)
        {
            console.log(e)
        }
}

const latest =async (req, res) =>{
    try{
    const data = await movies.find({series:true}).sort({"updatedAt": -1}).limit(30)
    res.json(data)

    }
    catch(e)
    {
        console.log(e)
    }
}


  
  // Schedule the function to run every hour


module.exports = {getMovies, pushMovie, findMovies, listMovies, getMoviescate, postComment, userData, loginIn ,getUser, pushUsers , changePass, notify, loginInAd, Searchmovie,  editMovie , pushSeries, deletemovie, deleteComment, deleteoneComment, upcomingPush, latest, findMovie, check, Search, verifyemailtoken, passchange,  passwordchange ,homemovie }