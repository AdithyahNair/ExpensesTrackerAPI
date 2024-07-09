const asyncHandler = require("express-async-handler");
const Category = require("../model/Category");
const Transaction = require("../model/Transaction");

//! User Authentication

const categoryController = {
  //* Add
  create: asyncHandler(async (req, res) => {
    const { name, type } = req.body;
    if (!name || !type) {
      throw new Error("Name and type are required to create a category.");
    }
    //! Lowercase name

    const normalizedName = name.toLowerCase();

    //! Validate category
    const validTypes = ["income", "expense"];
    if (!validTypes.includes(type.toLowerCase())) {
      throw new Error("Category Type is Invalid: " + type);
    }

    //! Check if category exists
    const categoryExists = await Category.findOne({
      name: normalizedName,
      user: req.user,
    });

    if (categoryExists) {
      throw new Error(
        `Category ${categoryExists.name} already exists in the database`
      );
    }

    const newCategory = await Category.create({
      user: req.user,
      name: normalizedName,
      type: type,
    });

    res.status(201).json(newCategory);
  }),

  //* fetch
  lists: asyncHandler(async (req, res) => {
    const categories = await Category.find({ user: req.user });
    res.status(200).json(categories);
  }),

  //* update

  update: asyncHandler(async (req, res) => {
    const categoryID = req.params.id;
    const { name } = req.body;
    const normalizedName = name.toLowerCase();
    const category = await Category.findById(categoryID);

    if (!category && category.user.toString() !== req.user.toString()) {
      throw new Error("Category not found or User not Authorized");
    }

    const oldName = category.name;

    category.name = normalizedName;

    const updatedCategory = await category.save();

    //! Affected transaction

    if (oldName !== updatedCategory.name) {
      await Transaction.updateMany(
        {
          user: req.user,
          category: oldName,
        },
        {
          $set: {
            category: updatedCategory.name,
          },
        }
      );
      res.status(200).json(updatedCategory);
    }
  }),

  //* delete
  delete: asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category && category.user.toString() === req.user.toString()) {
      const defaultCategory = "Uncategorized";

      await Transaction.updateMany(
        { user: req.user, category: category.name },
        { $set: { category: defaultCategory } }
      );

      //! Delete category

      await Category.findByIdAndDelete(req.params.id);

      res.status(200).json({
        message: "Category deleted and subsequent transactions updated",
      });
    } else {
      res.json({
        message: "Category not found or user not authorized",
      });
    }
  }),
};

module.exports = categoryController;
