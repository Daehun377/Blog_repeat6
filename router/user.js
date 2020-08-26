const express = require("express");
const router = express.Router();
const passport = require("passport");
const userModel = require("../model/user");


const {register_user, login_user, current_user, all_user} = require("../controller/user");

const checkAuth = passport.authenticate("jwt", {session : false});


//회원가입 기능
//@route POST http://localhost:3000/user/register
//@desc  Register User
//@access Public
router.post("/register", register_user);

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