const jwt = require("jsonwebtoken");
const User = require("../model/User");

const isAuthenticated = async (req, res, next) => {
  const authToken = req.headers?.authorization?.split(" ")[1];
  const user = await User.find({ token: authToken });
  if (!user.toString()) {
    const error = new Error("Incorrect AuthToken Entered.");
    next(error);
  } else {
    const verifyToken = jwt.verify(
      authToken,
      "PahrumpPimp",
      (error, decoded) => {
        if (error) {
          return false;
        } else {
          return decoded;
        }
      }
    );
    if (verifyToken) {
      req.user = verifyToken.id;
      next();
    } else {
      const err = new Error("Token expired, login again.");
      next(err);
    }
  }
};

module.exports = isAuthenticated;
