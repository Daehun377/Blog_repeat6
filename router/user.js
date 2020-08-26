const express = require("express");
const router = express.Router();


const {register_user, login_user} = require("../controller/user");

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
router.get("/current", (req, res) => {

});



module.exports = router;