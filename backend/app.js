const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const moment = require("moment");
const axios = require("axios");
const app = express();
const secretKey = "6LezV-gUAAAAANAAhrx5YQwCuPQ5svvlTASIfs8V";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET , POST , PUT , PATCH , DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type , Authorization");
  next();
});

app.use(async (req, res, next) => {
  const name = req.body.name;

  const today = moment().startOf("day");
  const count = await User.countDocuments({
    $and: [
      { ip: req.ip },
      {
        createdAt: {
          $gte: today.toDate(),
          $lte: moment(today)
            .endOf("day")
            .toDate()
        }
      }
    ]
  });

  if (count >= 3 && !req.body.token) {
    return res.json({
      success: false,
      toVerify: true
    });
  } else if (count >= 3 && req.body.token) {
    console.log("verify token");

    const token = req.body.token;
    console.log(`token ${token}`);
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
    const response = await axios.post(url);
    console.log("response", response);
    if (response.data.success) {
      next();
    } else {
      return res.json({
        success: false
      });
    }
  } else {
    next();
  }
});

app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(`error ${error}`);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
mongoose
  .connect("mongodb://localhost:27017/assignment", {
    useNewUrlParser: true
  })
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));
