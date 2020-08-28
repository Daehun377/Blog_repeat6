const jwt = require("jsonwebtoken");
const userModel = require("../model/user");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.MAIL_KEY);

const {validationResult} = require("express-validator"); //결과 값이 담김.

function tokenGenerator(payload) {
    return jwt.sign(payload, process.env.SECRET_TOKEN, {expiresIn : "1d"});
};


exports.register_user = (req, res) => {

    //이메일 유무 체크 -> 있으면 이미 등록 되었다고 하고, 없으면 사용자 메일로 인증요청메일 보내기! (sendgrid 로)

    const {name, email , password} = req.body;

    const errors = validationResult(req); //사용자 요청에 대한 유효결과값을 담겠다. 만약 패스되면 errors는 필요없음.

    if(!errors.isEmpty()){ //내용이 있다면
        return res.status(422).json(errors)
    }

    userModel
        .findOne({email})
        .then(user => {
            if(user){
                return res.status(400).json({
                    errors : "you are already registered"
                })
            }
            else {
                const payload = {name, email, password}; //입력값으로 페이로드 해주고
                const token = jwt.sign(payload, process.env.JWT_ACCOUNT_ACTIVATION, {expiresIn: "10m"});
                //토큰 유효 시간은 인증메일이니까 10분으로 짧게!

                const emailData = {
                    from : process.env.EMAIL_FROM,
                    to : email,
                    subject : "Account Activation Link",
                    html : `
                        <h1 style = "background-color: beige">이것은 코딩연습으로 하는 이메일 인증메일 보내기 메일입니다. 혹시 잘못 갔을 경우, 스펨으로 처리되오니 신경쓰지 말아주시기 바랍니다.</h1>
                        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
                        <hr />
                        <hr />
                        <p style="background-color: beige">오늘도 행복한 하루 되세요</p>
                        <p>This email may contain sensitive information</p>
                        <p>${process.env.CLIENT_URL}</p>
                    `
                };

                sgMail
                    .send(emailData)
                    .then(() => {
                        res.status(200).json({
                            message : `Email has been sent to ${email}`
                        })
                    })
                    .catch(err => {
                        res.status(500).json({
                            errors : err.message
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

    // userModel
    //     .findOne({email})
    //     .then(user => {
    //         if(!user){
    //             res.status(400).json({
    //                 message : "you have no account"
    //             })
    //         }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors) //
    }

    else {

        userModel
            .findOne({email})
            .then(user =>
                user.comparePassword(password, (err, isMatch) => {
                    if (err || isMatch === false) {
                        res.status(400).json({
                            errors: "password Incorrect"
                        })
                    } else {
                        const payload = {id: user.id, name: user.name, email: user.email, avatar: user.avatar};


                        res.status(200).json({
                            message: "login success",
                            success: isMatch,
                            tokenInfo: tokenGenerator(payload)
                        })
                    }
                })
            )
            .catch(err => {
                res.status(500).json({
                    message: err.message
                })
            })
    }
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