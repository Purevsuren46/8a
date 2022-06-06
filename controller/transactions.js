const Transaction = require("../models/Transaction");
const Good = require("../models/Good");
const path = require("path");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");

// api/v1/transactions
exports.getTransactions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Transaction);

  const transactions = await Transaction.find(req.query, select)
    .populate({
      path: "good",
      select: "name",
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions,
    pagination,
  });
});

exports.getUserTransactions = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getTransactions(req, res, next);
});

exports.getBillTransactions = asyncHandler(async (req, res, next) => {
    req.query.bill = req.params.id;
    return this.getTransactions(req, res, next);
});

exports.getUserReceipts = asyncHandler(async (req, res, next) => {
    req.query.createUser = req.userId;
    req.query.type = "Орлого";
    return this.getTransactions(req, res, next);
});

exports.getUserDrains = asyncHandler(async (req, res, next) => {
    req.query.createUser = req.userId;
    req.query.type = "Зарлага";
    return this.getTransactions(req, res, next);
});

exports.getTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

exports.deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (transaction.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  transaction.remove();

  res.status(200).json({
    success: true,
    data: transaction,
    whoDeleted: user.name,
  });
});

exports.updateTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (transaction.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;


  transaction.save();

  res.status(200).json({
    success: true,
    data: transaction,
  });
});