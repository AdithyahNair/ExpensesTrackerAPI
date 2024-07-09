const asyncHandler = require("express-async-handler");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");

//! User Authentication

const transactionController = {
  //* Add
  create: asyncHandler(async (req, res) => {
    const { type, amount, date, description, category } = req.body;
    if (!amount || !type || !date) {
      throw new Error(
        "Type, amount, and date required to create a transaction."
      );
    }

    //! Category exists or not

    const existingCategory = await Category.findOne({ name: category, type });

    if (!existingCategory) {
      throw new Error("Category does not exist. Cannot create transaction");
    }

    //! Create Transaction

    const transaction = await Transaction.create({
      user: req.user,
      type,
      category,
      amount,
      description,
    });
    res.status(201).json(transaction);
  }),

  //* filter and fetch transactions
  getFilteredTransactions: asyncHandler(async (req, res) => {
    const { startDate, endDate, type, category } = req.query;
    let filters = { user: req.user };

    if (startDate) {
      filters.date = { ...filters.date, $gte: new Date(startDate) };
    }

    if (endDate) {
      filters.date = { ...filters.date, $lte: new Date(endDate) };
    }

    if (type) {
      filters.type = type;
    }

    if (category) {
      if (category === "ALL") {
      } else if (category === "Uncategorized") {
        filters.category = "Uncategorized";
      } else {
        filters.category = category;
      }
    }

    const transactions = await Transaction.find(filters).sort({ date: -1 });
    res.status(200).json(transactions);
  }),

  //* update

  update: asyncHandler(async (req, res) => {
    //* Find transaction from params
    const transaction = await Transaction.findById(req.params.id);
    //* toString() is used to prevent object to object comparison since objects are passed as reference.\
    if (transaction && transaction.user.toString() === req.user.toString()) {
      transaction.type = req.body.type || transaction.type;
      transaction.amount = req.body.amount || transaction.amount;
      transaction.date = req.body.date || transaction.date;
      transaction.category = req.body.category || transaction.category;
      transaction.description = req.body.description || transaction.description;

      await transaction.save();
      res.status(200).json(transaction);
    }
  }),

  //* delete
  delete: asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);
    if (transaction && transaction.user.toString() === req.user.toString()) {
      await Transaction.findByIdAndDelete(req.params.id);
      res.status(200).json({
        message: "Transaction deleted successfully!",
      });
    }
  }),
};

module.exports = transactionController;
