const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//validation of data received
const {
  registerValidation,
  loginValidation,
} = require("../middleware/validation");

//assign a token to authorized user
const signToken = id => {
  return jwt.sign({ id }, process.env.TOKEN, {
    expiresIn: "12h",
  });
};

//send cookie and user data in a response
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    maxAge: 1000 * 60 * 60 * 12,
    httpOnly: true,
  });

  // remove user's password
  user.password = undefined;
  console.log(token, user);
  res.status(statusCode).json({
    status: "successfully authenticated",
    token,
    data: {
      user,
    },
  });
};

//on signup we expect username and password fields to be received in req.body
exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    // Validate data received, send error message if fail
    const { error } = registerValidation({
      username,
      password,
    });

    if (error) {
      return next(createError(400, error.details[0].message));
    }

    // Check if such username already registered
    await User.findOne({ username }, async (err, user) => {
      if (err) return next(createError(400, "Internal error occurred"));
      if (user) {
        return next(createError(400, "Such username already exists"));
      }
      if (!user) {
        // Create salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
          username,
          password: hashedPassword,
        });
        const saved = newUser.save();
        createSendToken(saved, 201, req, res);
      }
    });
  } catch (err) {
    next(createError(500, err.message));
  }
};

//on login we expect username and login to be received in req.body
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    //validate data received and send error if fail
    const { error } = loginValidation({ username, password });
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    //here we look if user exists in our database
    const user = await User.findOne({ username }, async (err, user) => {
      if (err) return next(createError(400, "Internal error occurred"));
      if (!user) {
        return next(createError(400, "No user with such username found"));
      } else {
        //check user's password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return next(createError(400, "Password is incorrect"));
        }

        createSendToken(user, 201, req, res);
      }
    });
  } catch (err) {
    next(createError(500, err.message));
  }
};

exports.logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ status: "success" });
};
