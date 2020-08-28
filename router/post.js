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

//게시글 전체 불러오기
//@route POST http://localhost:3000/post/
//@desc  Get Posts
//@access Public
router.get("/", (req, res) => {

    postModel
        .find()
        .sort({date : -1}) //날짜가 구 -> 신 까지
        .then(posts => {
            if(posts.length === 0){
                res.status(200).json({
                    message : "there is no post"
                })
            }
            res.status(200).json({
                counts : posts.length,
                postInfo : posts
            })
        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })
});

//게시글 디테일 불러오기
//@route POST http://localhost:3000/post/:post_id
//@desc  Get detail Post
//@access Private
router.get("/:post_id", checkAuth,(req, res) => {

    const id = req.params.post_id;

    postModel
        .findById(id)
        .then(post => {
            res.status(200).json(post)
        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })
});

//게시글 업데이트
//@route PATCH http://localhost:3000/post/:post_id
//@desc  Update post
//@access Private
router.patch("/:post_id", checkAuth, (req, res) => {

    const id = req.params.post_id;
    //아무나 업데이트 하면 안되니까 사용자 식별이 필수
    postModel
        .findById(id)
        .then(post => {
            if(post.user.toString() !== req.user.id){
                res.status(400).json({
                    message : "you are not the one who wrote this post"
                })
            }
            else{
                post
                    .updateOne({$set : {text : req.body.text}})
                    .then(() => {
                        res.status(200).json(post)
                    })
                    .catch(err => {
                        res.status(500).json({
                            error : err.message
                        })
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })
});

//게시글 업데이트
//@route Delete http://localhost:3000/post/:post_id
//@desc  Delete post
//@access Private
router.delete("/:post_id", checkAuth, (req, res) => {

    const id = req.params.post_id;

    postModel
        .findById(id)
        .then(post => {
            if(post.user.toString() !== req.user.id){
                res.status(200).json({
                    message : "you are not the one who wrote this post"
                })
            }
            else{
                post
                    .remove()
                    .then(() => {
                        res.status(200).json({success : true})
                    })
            }
        })
});

module.exports = router;