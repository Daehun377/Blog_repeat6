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

//게시글 지우기
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

//게시글에 좋아요 누르기
//routes Post http://localhost:3000/post/like/:post_id
//desc   Like post
//access Private
router.post("/like/:post_id", checkAuth, (req, res) => {

    const id = req.params.post_id;
    //라이크를 한사람당 한명으로 유지하기 위해서, 유저의 라이크가 0보다 많으면 이미 좋아요 한거라고 리턴, 아니면 좋아요 등
    postModel
        .findById(id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length >0){
                return res.status(200).json({
                    message : "user already liked this post"
                })
            }
            else{
                post.likes.unshift({user : req.user.id})
                post
                    .save()
                    .then(post => {
                        res.status(200).json(post)
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })
});

//게시글 좋아요 지우기
//routes Delete http://localhost:3000/post/unlike/:post_id
//desc   Delete like from post
//access Private
router.delete("/unlike/:post_id", checkAuth, (req, res )=> {

    const id = req.params.post_id;
    //먼저 좋아요들 중에서 해당 유저 아이디와 같은 아이디의 라이크가 없으면 좋아요 한적이 없다 리턴, 아닌 경우는 라이크중에 찾아서 없애주
    postModel
        .findById(id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length ===0){
                return res.status(400).json({
                    message : "you've never liked this post"
                })
            }
            const removeIndex = post.likes
                .map(like => like.user.toString())
                .indexOf(req.user.id)

            post.likes.splice(removeIndex, 1)

            post
                .save()
                .then(post => res.status(200).json(post))
        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })
});

//댓글 등록
//@routes POST http://localhost:3000/post/comment/:post_id
//@desc   Add comment to post
//@access Private
router.post("/comment/:post_id", checkAuth, (req, res) => {

    const id = req.params.post_id;
    //여기서 코멘트의 경우, 이름을 passposrt의 user에서 받아오는게 아니라, 직접 입력해 줄 수 있도록 req.body에서 받을 예정
    postModel
        .findById(id)
        .then(post => {

            const newComment = {
                text : req.body.text,
                name : req.body.name,
                avatar : req.user.avatar,
                user : req.user.id
            };

            post.comments.unshift(newComment);

            post
                .save()
                .then(post => res.status(200).json(post))
                .catch(err => {
                    res.status(500).json({
                        error : err.message
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })
});

//댓글 지우기
//@routes Delete http://localhost:3000/post/comment/:post_id/:comment_id
//@desc   Remove comment from post
//@access Private
router.delete("/comment/:post_id/:comment_id", checkAuth,(req, res) => {

    const id = req.params.post_id;

    postModel
        .findById(id)
        .then(post => {
            //comment.user 은 객체로 인식될 수 있기에, toString()을 꼭 해줘서 string타입으로 바꿔준다. 
            if(post.comments.filter(comment => comment.user.toString() === req.user.id).length === 0){
                return res.status(200).json({
                    message : "you have no authorization this comment"
                })
            }
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
                return res.status(200).json({
                    message : "no comment"
                })
            }
            //Find commentIndex and remove the comment
            const commentIndex = post.comments
                .map(comment => comment._id.toString())
                .indexOf(req.params.comment_id)

            post.comments.splice(commentIndex, 1);

            post
                .save()
                .then(post => res.status(200).json(post))
        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })
});
module.exports = router;