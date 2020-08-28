const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotEnv = require("dotenv");
const passport = require("passport");

dotEnv.config();
const app = express();

//데이터베이스 연결
require("./config/database");



//미들웨어 연결설
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(passport.initialize());

//패스포트 함수 불러오기
require("./config/passport")(passport);

//라우터 정의
const userRoute = require("./router/user");
const profileRoute = require("./router/profile");
const postRoute = require("./router/post");

//라우팅
app.use("/user", userRoute);
app.use("/profile", profileRoute);
app.use("/post", postRoute);


const PORT = process.env.PORT || 7000;

app.listen(PORT, console.log(`server starts at http://localhost:${PORT}`));