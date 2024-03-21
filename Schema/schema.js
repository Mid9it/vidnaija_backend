const mongoose = require('mongoose')


const notification = mongoose.Schema({
    message:{
        type:String
    },
    data:{
        type:Date
    , default: Date.now},
})
const video = mongoose.Schema({
    title:{
        type:String
    },
    link:{
        type:String
    },
    category:{
        type:String
    },
    message:{
        type:String
    },
    reaction:{
        type:Number
    }
})


const user = mongoose.Schema({
    user_name:{
        type:String
    },
    email:{
        type:String
    }
    ,
    admin:{
        type:Boolean
    },
    password:{
        type:String
    },
    group_access:{
        type:Boolean
    },
    profile_image:{
        type:String
    },
    rank:{
        type:Number
    },
    notification:{
        notify:[notification],
        alarm:{
            type:Boolean
        }},
    suspend:{
        type:Boolean
    },
    ban:{
        type:Boolean
    },
    videos:[video]
},{timestamps:true})




const type = mongoose.Schema({
    a:{type:String},
    b:{type:String},
    c:{type:String}
})
const  reply = mongoose.Schema({
    chat:{
        type:String
    },
    name:{
        type:String
    },
    id_user:{
        type:String
    },
      profile_image:{
        type:String
    },
    reaction:{
        type:Number
    },
    data:{
        type:Date
    , default: Date.now},
    rank:{
        type:Number
    },
    re:{
        type:Boolean
    }
})

const comment = mongoose.Schema({
    chat:{
        type:String
    },
    name:{
        type:String
    },
    id_user:{
        type:String
    },
      profile_image:{
        type:String
    },
    reaction:{
        type:Number
    },
    data:{
        type:Date
    , default: Date.now},
    rank:{
        type:Number
    },
    reply:[reply],
    re:{
        type:Boolean
    }
})

const episode = mongoose.Schema({
    no:{
        type:Number
    },
        link:{
            type:String
        }
})

const season_no = mongoose.Schema({
        episode:[episode]
})


const movies = mongoose.Schema({
        title:{
            type:String
        },
        rating:{
            type:String
        },
        year:{
            type:Number
        },
        type:type,
        runtime:{
            type:String
        },
        rated:{
            type:String
        },
        release:{
            type:String
        },
        image:{
            type:String
        },
        overview:{
            type:String
        },
        comment:[comment],
        top:{
            type:Boolean
        },
        lowdownload:{
            size:{
            type:Number},
            link:{
                type:String   
            }
        },
        highdownload:{
            size:{
                type:Number},
                link:{
                    type:String   
                }
        },
        trailer:{
            type:String
        },
        category:{
            type:String
        },
        series:{
            type:Boolean
        },
        seasons:[season_no],
        
},{timestamps:true})

const upcoming = mongoose.Schema({
    title:{
        type:String
    },
    image:{
        type:String
    },
    src:{
        type:String
    }
})


module.exports.movies = mongoose.model('movies', movies)
module.exports.upcoming = mongoose.model('upcoming', upcoming)
module.exports.user = mongoose.model('user', user)

