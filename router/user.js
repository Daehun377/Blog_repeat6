const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const userModel = require("../model/user");


const {register_user, login_user, current_user, all_user} = require("../controller/user");

const checkAuth = passport.authenticate("jwt", {session : false});


//회원가입 기능
//@route POST http://localhost:3000/user/register
//@desc  Register User / sendEmail for Activation
//@access Public
router.post("/register", register_user);

//회원 가입한 계 활성화 기정
//@route POST http://localhost:3000/user/activation
//@desc  Activation account from confirm email
//@access Private
router.post("/activation", (req, res)=> {

    const {token} = req.body; //이메일로 제공되는 토큰을 입력하는 것을 비구조할당 정  (물론 실제의 서비에선 이 토큰이 보이진 않겠지만)

    if(token){
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {

            if(err){
                return res.status(400).json({
                    error : "Expired Link. SignUp again please!" //토큰이 유효하지 않은거니까 기간이 만료된것일것.
                })
            }
            else{

                const {name, email, password} = jwt.decode(token);

                const newUser = new userModel({
                    name, email, password
                });

                console.log(jwt.decode(token));
                console.log("userInfo", newUser);

                newUser
                    .save()
                    .then(user => {
                        return res.status(200).json({
                            message : "successful signup",
                            userInfo : user
                        })
                    })
                    .catch(err => {
                        res.status(500).json({
                            message : err.message
                        })
                    })
            }
        });
    }
});

//로그인 기능
//@route POST http://localhost:3000/user/login
//@desc  Login User
//@access Public
router.post("/login", login_user);

//현재 유저 정보 불러오기
//@route GET http://localhost:3000/user/current
//@desc  Current Info
//@access Private
router.get("/current", checkAuth, current_user);

//모든 유저 정보 불러오기
//@route GET http://localhost:3000/user/all
//@desc  All Users Info
//@access Private(Only Admin can access)
router.get("/all", checkAuth, all_user);


module.exports = router;