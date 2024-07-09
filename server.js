const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRouter");
const errorHandler = require("./middlewares/errorHandlingMiddleware");
const categoryRouter = require("./routes/categoryRouter");
const transactionRouter = require("./routes/transactionRouter");
const app = express();
const PORT = process.env.PORT || 3000;

//! Database connection

mongoose
  .connect(
    "mongodb+srv://adithyahnair:a6DCTqNUOukzsV10@adistein.pgcbqct.mongodb.net/students-database"
  )
  .then(() => console.log("DB connected successfully!!"))
  .catch((error) => console.log(error));

//! Middlewares

app.use(express.json());

//! Routes

app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", transactionRouter);

//! Error Handling middleware

app.use(errorHandler);

//! Start the server

app.listen(PORT, console.log(`Server is listening on ${PORT}`));
