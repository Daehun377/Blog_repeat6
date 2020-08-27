const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(

    {
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user",
            required : true
        },
        introduce : {
            type : String,
            required: true,
            max : 40
        },
        company : {
            type : String
        },
        website : {
            type : String
        },
        location : {
            type : String
        },
        status : {
            type : String
        },
        skills : {
            type : [String], //여러개를 쓸거니까 배열로
            required : true
        },
        gender : {
            type : String,
            default : "male"
        },
        githubusername : {
            type : String
        },
        experience : [],
        education : []
    },
    {
        timestamps : true
    }

);

module.exports = mongoose.model("profile", profileSchema);