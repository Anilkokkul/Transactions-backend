const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  title: String,
  price: {
    type: Number,
  },
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: {
    type: Date,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
