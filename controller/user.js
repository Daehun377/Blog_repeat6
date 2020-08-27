const jwt = require("jsonwebtoken");
const userModel = require("../model/user");

function tokenGenerator(payload) {
    return jwt.sign(payload, process.env.SECRET_TOKEN, {expiresIn : "1d"});
};


exports.register_user = (req, res) => {

    //이메일 유무 체크 -> 이메일 있을시 (이미 등록된 이메일이다) 없을시 패스워드 암호화 진행 -> 데이터베이스에 저장

    const {name, email , password} = req.body;
    userModel
        .findOne({email})
        .then(user => {
            if(user){
                res.status(400).json({
                    message : "you are already registered"
                })
            }
            else{
                const newUser = new userModel({
                    name, email, password
                });

                newUser
                    .save()
                    .then(user => {
                        console.log(user);

                        res.status(200).json({
                            id : user.id,
                            name : user.name,
                            email : user.email,
                            password : user.password,
                            avatar : user.avatar,
                            date : {
                                createdDate : user.createdAt,
                                updatedDate : user.updatedAt
                            }
                        })
                    })
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
};

exports.login_user = (req, res) => {

    //이메일 유무 체크 -> 없으면 없다고, 있으면 패스워드 비교 -> 로그인 성공, jwt토큰 발행

    const {email, password} = req.body;

    userModel
        .findOne({email})
        .then(user => {
            if(!user){
                res.status(400).json({
                    message : "you have no account"
                })
            }
            else{
                user.comparePassword(password, (err,isMatch) => {
                    if(err || isMatch === false){
                        res.status(400).json({
                            message : "password Incorrect"
                        })
                    }
                    else{
                        const payload = {id : user.id, name : user.name, email : user.email, avatar : user.avatar};


                        res.status(200).json({
                            message : "login success",
                            success : isMatch,
                            tokenInfo : tokenGenerator(payload)
                        })
                    }
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message : err.message
            })
        })
};

exports.current_user = (req, res) => {

    userModel
        .findById(req.user.id)
        .then(user => {
            res.status(200).json({
                message : "your current id",
                userInfo : user
            })
        })
        .catch(err => {
            res.status(500).json({
                message : err.message
            })
        })
};

exports.all_user = (req, res) => {

    //요청하는 유저 정보 확인 => 만약 유저가 관리자 역할이 아니면 에러 , 맞으면 전체정보 반환

    userModel
        .findById(req.user.id)
        .then(user => {
            if(user.role !== "admin"){
                res.status(400).json({
                    message : "you are not admin"
                })
            }
            else{
                userModel
                    .find()
                    .then(users => res.status(200).json(users))
            }
        })
        .catch(err => {
            res.status(500).json({
                message : err.message
            })
        })
};