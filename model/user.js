const mongoose = require("mongoose");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(

    {
        name : {
            type : String,
            required : true
        },
        email : {
            type : String,
            required : true
        },
        password : {
            type : String,
            required : true
        },
        avatar : {
            type : String
        },
        role : {
            type : String,
            default : "user"
        }
    },
    {
        timestamps : true
    }
);

//Using pre function for "save" to hash password before saving.
userSchema.pre("save", async function(next) {

    try{
        console.log("entered");

        const avatar = gravatar.url(this.email, {
            s : "200",
            r : "pg",
            d : "mm"
        });

        this.avatar = avatar;

        const salt = await bcrypt.genSalt(10);

        const passwordHash = await bcrypt.hash(this.password, salt);

        this.password = passwordHash;

        console.log("exited");

        next();
    }
    catch(err){
        next(err)
    }
});

//Using methods for comparing password when it logins

userSchema.methods.comparePassword = function(candidatePassword, cb){
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if(err){
            return cb(err) //에러가 뜨면 에러를 리턴 ,
        }
        cb(null, isMatch) //이땐 isMatch가 true일 경우. 토큰 generator가 실행된다.
    })
}


module.exports = mongoose.model("user", userSchema);