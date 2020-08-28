const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user",
            required : true
        },
        text : {
            type : String,
            required : true
        },
        name : {
            type : String
        },
        avatar : {
            type : String
        },
        likes : [
            {
                user : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "user",
                    required : true
                }
            }
        ],
        comments : [
            {
                user : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "user",
                    required : true
                },
                text : {
                    type : String,
                    required : true
                },
                name : {
                    type : String
                },
                avatar : {
                    type : String
                },
                date : {
                    type : Date,
                    default : Date.now //현재 시간을 해서 댓글 남긴 시간을 반영한다.
                }
            }
        ]
    },
    {
        timestamps : true
    }
);

module.exports = mongoose.model("post", postSchema);