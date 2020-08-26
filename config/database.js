const mongoose = require("mongoose");

const dbUrl = process.env.MONGO_URL;

const dbOptions = { useNewUrlParser : true, useUnifiedTopology : true};

mongoose
    .connect(dbUrl, dbOptions)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err.message))