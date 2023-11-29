const express = require("express");
require("dotenv").config();
const { db } = require("./db/db.connect");
const axios = require("axios");
const cors = require("cors");
db();
const Transaction = require("./model/transaction.model");
const transactionRoutes = require("./Routes/transaction.routes");
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/api", transactionRoutes);

port = process.env.PORT || 8001;

// API Documentation: https://documenter.getpostman.com/view/28958585/2s9YeG7XQA

app.get("/api/initialize-transaction", async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const seedData = response.data;
    await Transaction.insertMany(seedData).then((data) => {
      res
        .status(200)
        .send({
          message: "Database initialized with seed data successfully.",
          SeedData: data,
        })
        .catch((error) => {
          res.status(400).send({
            message: "Error in initializing database",
            Error: error.message,
          });
        });
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
});

app.get("/get-transactions", async (req, res) => {
  try {
    await Transaction.find()
      .then((data) => {
        res.status(200).send({
          message: "Transactions retrieved successfully",
          transactions: data,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: "Error in initializing database",
          Error: error.message,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send({ message: "Welcome to the API" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
