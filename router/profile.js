const express = require("express");
const router = express.Router();
const passport = require("passport");

const profileModel = require("../model/profile");

const checkAuth = passport.authenticate("jwt", {session : false});
//프로필 등록
//@route POST http://localhost:3000/profile/
//@desc  Register profile from user
//@access Private

router.post("/profile", checkAuth, (req, res) => {

    const profileFields = {}; //프로파일 필드 객체를 만들어줘서 프로파일에 들어갈 스키마들을 넣어준다.

    profileFields.user = req.user.id // 유저로는 req.user.id가 들어감

    if(req.body.introduce) profileFields.introduce = req.body.introduce; // 입력값이 있으면 프로파일 필드에 입력값을 키의 값으로 넣어줌
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.gender) profileFields.gender = req.body.gender;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    if(typeof req.body.skills !== "undefined" || req.body.skills.length !== 0){
        profileFields.skills = req.body.skills.split(",");
    } //타입이 undefiled가 아니거나 입력값이 0 가 아닐경우, 배열을 , 기점으로 나눠서 넣어준다


    //프로파일모델에 입력값 등록. 프로파일이 있으면 이미 프로파일이 있다고 하고 없으면 등록 한다.
    profileModel
        .findOne({user : req.user.id})
        .then(profile => {
            if(profile){
                return res.status(200).json({
                    message : "profile already exists, please update your profile"
                })
            }
            else{
                new profileModel(profileFields)
                    .save()
                    .then(profile => res.status(200).json(profile))
                    .catch(err => {
                        res.status(500).json({
                            message : err.message
                        })
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                message : err.message
            })
        })
});







module.exports = router;