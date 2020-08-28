const express = require("express");
const router = express.Router();
const passport = require("passport");
const postModel = require("../model/post");

const checkAuth = passport.authenticate("jwt", {session : false});

//게시글 올리기
//@route POST http://localhost:3000/post/register
//@desc  Register Post
//@access Private
router.post("/register", checkAuth, (req, res) => {

    //checkAuth를 통해 name, user, avatar는 payload안에 있는 정보들로 넣어주고, 텍스트는 입력값으로
    const newPost = new postModel({
        text : req.body.text,
        name : req.user.name,
        user : req.user.id,
        avatar : req.user.avatar
    });

    newPost
        .save()
        .then(post => {
            res.status(200).json(post)
        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })
});

//게시글 불러오기
//@route POST http://localhost:3000/post/
//@desc  Get Post
//@access Private



module.exports = router;