const mongoose =require('mongoose')
const ownerSchema=mongoose.Schema({
    fullname:{
        type:String,
        minLength:3,
        trim:true,
    },
    email:{
        type:String,
        unique:true,  // index: admins are looked up by email on every login
        sparse:true,  // sparse because email has no required:true
    },
    password:String,
    products:{
        type:Array,
        default:[],
    },
    picture:String,
    gstin:String,

})


module.exports= mongoose.model("owner",ownerSchema)