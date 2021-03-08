const createError = require("http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const {
  registerValidation,
  loginValidation,
} = require("../middleware/validation");

const signToken = id => {
  return jwt.sign({ id }, process.env.TOKEN, {
    expiresIn: "12h",
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    maxAge: 1000 * 60 * 60 * 12,
    httpOnly: true,
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "successfully authenticated",
    token,
    data: {
      user,
    },
  });
};

//on signup we expect email, name and password fields to be received in req.body
exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    console.log(email);
    // Validate data received, send error message if fail
    const { error } = registerValidation({
      email,
      password,
      name,
    });

    if (error) {
      console.log("error at validation");
      return next(createError(400, error.details[0].message));
    }

    // Check if such email already registered
    await User.findOne({ email }, async (err, user) => {
      console.log("Checking user ");
      if (err) return console.log(err); //next(createError(400, "Internal error occurred"));
      if (user) {
        return next(createError(400, "Such email already exists"));
      }
      if (!user) {
        console.log("Registering");
        // Create salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
          email,
          password: hashedPassword,
          name,
        });
        const saved = newUser.save();
        createSendToken(saved, 201, req, res);
      }
    });
  } catch (err) {
    next(createError(500, err.message));
  }
};

//on login we expect email and login to be received in req.body
exports.login = async (req, res, next) => {
  try {
    //validate data received and send error if fail
    const { error } = loginValidation(req.body);
    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { email, password } = req.body;

    //here we look if user exists in our database
    const user = await User.findOne({ email: email }, async (err, user) => {
      if (err) return next(createError(400, "Internal error occurred"));
      if (!user) {
        return next(createError(400, "No user with such email found"));
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
