const {Strategy, ExtractJwt} = require("passport-jwt");
const userModel = require("../model/user");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //헤더에서 토큰 추출
opts.secretOrKey = process.env.SECRET_TOKEN; // 시크릿 토큰

module.exports = passport => {
  passport.use(
      new Strategy(opts, (payload, done) => {
          console.log(opts, opts.jwtFromRequest, opts.secretOrKey, payload, done)
          userModel
              .findById(payload.id)
              .then(user => {
                  if(!user){
                      return done(null, false)
                  }
                  else{
                      done(null, user)
                  }
              })
              .catch(err => console.log(err))
      })
  )
};