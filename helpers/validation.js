const {check} = require("express-validator");

exports.validationSignup = [

    check(`name`, `name is required`) //이름 필드가 없으면 name이 필요해요! 리턴
        .notEmpty() //이름 필드에 대해서는 비어있지 않아야하고
        .isLength({min : 4, max : 32 }) //길이는 4~32자리
        .withMessage(`name must be between 4 and 32`),
    check(`email`)
        .isEmail()
        .withMessage(`must be a valid email address`),
    check(`password`, `password is required`)
        .notEmpty()
        .isLength({min : 6})
        .withMessage(`password must contain at least 6 characters`)
        .matches(/\d/)
        .withMessage(`password must contain a number`)
];

exports.validationLogin = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password', 'password is required').notEmpty(),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .matches(/\d/)
        .withMessage('password must contain a number')
];