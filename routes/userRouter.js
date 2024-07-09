const express = require("express");
const userController = require("../controllers/userController");
const isAuthenticated = require("../middlewares/isAuth");

const userRouter = express.Router();

userRouter.post("/api/v1/users/register", userController.register);
userRouter.post("/api/v1/users/login", userController.login);
userRouter.get(
  "/api/v1/users/profile",
  isAuthenticated,
  userController.profile
);
userRouter.put(
  "/api/v1/users/change-password",
  isAuthenticated,
  userController.changeUserPassword
);
userRouter.put(
  "/api/v1/users/update-profile",
  isAuthenticated,
  userController.updateUserProfile
);

module.exports = userRouter;
