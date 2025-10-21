import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    firstName:{
        type:String,
        required: true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required: true
    },
    farmLocation:{
        type:String,
        required: true,
    },
    farmSize:{
        type:String,
        enum: ["small", "medium", "large", "commercial"],
        required: true,
    }, 
    primaryCrops:{
        type:String,
        required: true,
    },
    agreeTerms:{
        type:Boolean,
        required: true,
        default: false
    },
    agreePrivacy:{
        type:Boolean,
        required: true,
        default:false
    }
}, {timestamps:true});

const userModel = mongoose.model('Users', userSchema);

export default userModel;