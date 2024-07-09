const express = require("express");
const isAuthenticated = require("../middlewares/isAuth");
const transactionController = require("../controllers/transactionController");

const transactionRouter = express.Router();

transactionRouter.post(
  "/api/v1/transactions/create",
  isAuthenticated,
  transactionController.create
);
transactionRouter.get(
  "/api/v1/transactions/lists",
  isAuthenticated,
  transactionController.getFilteredTransactions
);
transactionRouter.put(
  "/api/v1/transactions/update/:id",
  isAuthenticated,
  transactionController.update
);
transactionRouter.put(
  "/api/v1/transactions/delete/:id",
  isAuthenticated,
  transactionController.delete
);

module.exports = transactionRouter;
