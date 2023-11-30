const axios = require("axios");
const Transaction = require("../model/transaction.model");

exports.transactionList = async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = "" } = req.query;
    const searchValue = search.trim();
    const filter = {
      $or: [
        { title: { $regex: `.*${searchValue}.*`, $options: "i" } },
        {
          description: { $regex: `.*${searchValue}.*`, $options: "i" },
        },
        { price: parseFloat(searchValue) || 0 },
      ],
    };
    const transactions = await Transaction.find(filter)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .then((data) => {
        res.status(200).send({
          message: "Filtered Transactions retrieved Successfully",
          currentPage: page,
          transactions: data,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: "Error in filtering transactions",
          Error: error,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.query;

    const monthOfSale = await Transaction.findOne({
      dateOfSale: {
        $gte: new Date(`${month}-01T00:00:00Z`),
        $lt: new Date(`${month}-31T23:59:59Z`),
      },
    });
    if (!monthOfSale) {
      return res.status(200).send({
        message: "No sales made on this month",
      });
    }

    const totalSaleAmount = await Transaction.aggregate([
      {
        $match: {
          sold: true,
          dateOfSale: {
            $gte: new Date(`${month}-01T00:00:00Z`),
            $lt: new Date(`${month}-31T23:59:59Z`),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: "$price",
          },
        },
      },
    ]);

    const TotalSoldItems = await Transaction.countDocuments({
      sold: true,
      dateOfSale: {
        $gte: new Date(`${month}-01T00:00:00Z`),
        $lt: new Date(`${month}-31T23:59:59Z`),
      },
    });
    const TotalNotSoldItems = await Transaction.countDocuments({
      sold: false,
      dateOfSale: {
        $gte: new Date(`${month}-01T00:00:00Z`),
        $lt: new Date(`${month}-31T23:59:59Z`),
      },
    })
      .then((data) => {
        res.status(200).send({
          message: "Statistics retrieved Successfully",
          totalSaleAmount: totalSaleAmount[0].totalAmount,
          TotalSoldItems,
          TotalNotSoldItems: data,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: "Error in Statistics retrieving",
          Error: error,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.createPieChart = async (req, res) => {
  try {
    const { month } = req.query;

    const pieChartData = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: new Date(`${month}-01T00:00:00Z`),
            $lt: new Date(`${month}-31T23:59:59Z`),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          count: "$count",
        },
      },
    ])
      .then((data) => {
        if (data.length > 0) {
          res.status(200).send({
            message: "Pie Chart Data retrieved Successfully",
            ChartData: data,
          });
        } else {
          res.status(404).send({
            message: "No data found",
          });
        }
      })
      .catch((error) => {
        res.status(400).send({
          message: "Error in data retrieving",
          Error: error.message,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      Error: error.message,
    });
  }
};

exports.createBarChart = async (req, res) => {
  try {
    const { month } = req.query;

    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity },
    ];
    const barChartData = await Promise.all(
      priceRanges.map(async ({ min, max }) => ({
        priceRange: `${min} - ${max}`,
        itemCount: await Transaction.countDocuments({
          dateOfSale: {
            $gte: new Date(`${month}-01T00:00:00Z`),
            $lt: new Date(`${month}-31T23:59:59Z`),
          },
          price: { $gte: min, $lt: max },
        }),
      }))
    )
      .then((data) => {
        res.status(200).send({
          message: "Bar chart data retrieved",
          ChartData: data,
        });
      })
      .catch((error) => {
        res.status(400).send({
          message: "Error in data retrieving",
          Error: error.message,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.allAPIData = async (req, res) => {
  try {
    const { month } = req.query;
    console.log(month);
    // const transactionData = await axios(
    //   `http://localhost:5000/api/transactions`
    // );
    const statisticsData = await axios.get(
      `http://localhost:5000/api/statistics?month=${month}`
    );
    const pieChartData = await axios.get(
      `http://localhost:5000/api/pie-chart?month=${month}`
    );
    const barChartData = await axios.get(
      `http://localhost:5000/api/bar-chart?month=${month}`
    );
    res.status(200).send({
      message: "Transactions retrieved Successfully",
      StatisticsData: statisticsData.data,
      PieChartData: pieChartData.data,
      BarChartData: barChartData.data,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};
