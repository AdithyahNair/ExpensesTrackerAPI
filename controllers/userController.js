const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/User");

//! User Authentication

const userController = {
  //* Register
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    //! Validate
    if (!username || !email) {
      throw new Error("Please fill all of the fields!");
    }

    //! If user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("User already exists! Please login");
    }

    //! Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //! Create user and save into DB
    const userCreated = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.json({
      username: userCreated.username,
      email: userCreated.email,
      id: userCreated._id,
    });
  }),

  //* Login
  login: asyncHandler(async (req, res) => {
    //! Get userData
    const { email, password } = req.body;
    //! Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid Login Credentails");
    }

    //! Compare userpassword
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid Login Credentails");
    }

    //! Delete previous token

    // const oldToken = req.headers?.authorization.split(" ")[1];

    // jwt.de

    //! Generate a token for the user and save it
    const token = jwt.sign({ id: user._id }, "PahrumpPimp", {
      expiresIn: "30d",
    });
    user.token = token;
    await user.save();

    //! Send the response
    res.json({
      message: "User logged in successfully",
      token,
      id: user._id,
      email: user.email,
      username: user.username,
    });
  }),

  //* GET profile

  profile: asyncHandler(async (req, res) => {
    //! Find user

    const { username, email } = await User.findById(req.user);

    if (!username) {
      throw new Error("User profile does not exist.");
    } else {
      res.json({
        username,
        email,
      });
    }
  }),

  //* Change password
  changeUserPassword: asyncHandler(async (req, res) => {
    const { newPassword } = req.body;
    //! Find user

    const user = await User.findById(req.user);

    if (!user.username) {
      throw new Error("User profile does not exist.");
    }

    //!Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    //! Assign new password
    user.password = hashedPassword;

    //! Resave user
    await user.save();
    res.json({
      message: "Password changed successfully!",
    });
  }),

  //* Update User
  updateUserProfile: asyncHandler(async (req, res) => {
    const { email, username } = req.body;
    //! Find user

    const user = await User.findByIdAndUpdate(
      req.user,
      {
        email,
        username,
      },
      {
        new: true,
      }
    );

    await user.save();

    res.json({
      message: "User updated successfully!",
    });
  }),
};

module.exports = userController;
