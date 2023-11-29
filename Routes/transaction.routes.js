const express = require("express");
const {
  transactionList,
  getStatistics,
  createPieChart,
  createBarChart,
  allAPIData,
} = require("../Controllers/transaction.controllers");

const router = express.Router();

router.get("/transactions", transactionList);

router.get("/statistics", getStatistics);

router.get("/pie-chart", createPieChart);

router.get("/bar-chart", createBarChart);

router.get("/all-api", allAPIData);

module.exports = router;
