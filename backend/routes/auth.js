const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth");

const User = require("../models/user");
const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject("Email Already Exists");
          }
        });
      })
      .normalizeEmail()
  ],
  authController.signup
);
module.exports = router;

// body("password")
// .trim()
// .isLength({ min: 5 })
