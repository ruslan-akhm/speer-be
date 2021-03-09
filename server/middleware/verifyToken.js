const createError = require("http-errors");
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  try {
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    //protecting routes from accessing them by unauthorized user
    if (!token) {
      return next(createError(401, "Access Denied"));
    }
    //if user is authorized - attach their id to req.user
    const verifiedUser = jwt.verify(token, process.env.TOKEN);
    req.user = verifiedUser;
    next();
  } catch (err) {
    next(createError(401, "Invalid Token"));
  }
};
