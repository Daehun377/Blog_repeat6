const express = require("express");
const router = express.Router();
const passport = require("passport");

const profileModel = require("../model/profile");

const checkAuth = passport.authenticate("jwt", {session : false});
//프로필 등록
//@route POST http://localhost:3000/profile/register
//@desc  Register/Edit profile from user
//@access Private

router.post("/register", checkAuth, (req, res) => {

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


    //프로파일모델에 프로파일이 있으면 수정해서 업데이트 할수 있도록 해주고, 아예 없으면 새로 등록할 수 있게 해준다.
    profileModel
        .findOne({user : req.user.id})
        .then(profile => {
            if(profile){

                profileModel
                    .findOneAndUpdate(
                        {user : req.user.id},
                        {$set : profileFields},
                        {new : true}
                    )
                    .then(profile =>{
                        res.status(200).json(profile)
                    })
                    .catch(err => {
                        res.status(500).json({
                            message : err.message
                        })
                    })
            }
            else{
                new profileModel(profileFields)
                    .save()
                    .then(profile => res.status(200).json(profile))
                    .catch(err =>{
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


//모든 프로필 불러오기
//@route GET http://localhost:3000/profile/total
//@desc  Get total Profiles
//@access Public

router.get("/total", (req, res) => {

    profileModel
        .find() //find는 배열로 나옴. findByOne / findById 등은 객체로 나온다.
        .populate("user", "name email avatar") // 이렇게 해도 문제가 없네?? ["name", "email", "avatar"]로 해도 되네
        .then(profiles => {
            if(profiles.length === 0){
                res.status(200).json({
                    message : "there is no profile registered"
                })
            }
            else{
                res.status(200).json({
                    count : profiles.length,
                    profiles : profiles
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message : err.message
            })
        })
});

//개인 프로필 불러오기
//@route GET http://localhost:3000/profile/
//@desc  Get private Profiles
//@access Private

router.get("/", checkAuth,(req, res) => {

   profileModel
       .findOne({user : req.user.id})
       .then(profile => {

           if(!profile){
               res.status(200).json({
                   message : "there is no profile plz register"
               })
           }
           res.status(200).json(profile)
       })
       .catch(err => {
           res.status(500).json({
               message : err.message
           })
       })
});

//개인 프로필 지우기
//@route Delete http://localhost:3000/profile/
//@desc  Delete private Profiles
//@access Private

router.delete("/", checkAuth, (req, res) => {

    profileModel
        .findOneAndDelete({user : req.user.id})
        .then(() => {
            res.status(200).json({
                message : "successful profile deleted"
            })
        })
        .catch(err => {
            res.status(500).json({
                message : err.message
            })
        })
});

//Add Experience
//@route POST http://localhost:3000/profile/experience
//@desc  Add experience to profile
//@access Private
router.post("/experience", checkAuth,(req, res) => {

    //모델에서 유저 찾아주고 => 유저 모델이 있으면 등록
    profileModel
        .findOne({user : req.user.id})
        .then(profile => {

            const newExperience = {

                title : req.body.title,
                company : req.body.company,
                location : req.body.location,
                from : req.body.from,
                to : req.body.to,
                current : req.body.current,
                description : req.body.description
            };

            profile.experience.unshift(newExperience)

            profile
                .save()
                .then(profile => {
                    res.status(200).json(profile)
                })
                .catch(err => {
                    res.status(500).json({
                        message : err.message
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })

});

//Add Education
//@route POST http://localhost:3000/profile/education
//@desc  Add education to profile
//@access Private
router.post("/education", checkAuth, (req, res) => {

    profileModel
        .findOne({user : req.user.id})
        .then(profile => {

            const newEducation = {

                school : req.body.school,
                degree : req.body.degree,
                fieldOfStudy : req.body.fieldOfStudy,
                from : req.body.from,
                to : req.body.to,
                current : req.body.current,
                description : req.body.description

            };

            profile.education.unshift(newEducation);

            profile
                .save()
                .then(profile => {
                    res.status(200).json(profile)
                })
                .catch(err => {
                    res.status(500).json({
                        message : err.message
                    })
                })

        })
        .catch(err => {
            res.status(500).json({
                error : err.message
            })
        })
});

module.exports = router;