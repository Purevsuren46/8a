const Bill = require("../models/Bill");
const Good = require("../models/Good");
const Transaction = require("../models/Transaction");
const path = require("path");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");

// api/v1/bills
exports.getBills = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Bill);

  const bills = await Bill.find(req.query, select)
    .populate({
      path: "transaction",
      select: "name averagePrice",
    })
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: bills.length,
    data: bills,
    pagination,
  });
});

exports.getUserBills = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getBills(req, res, next);
});

exports.getUserReceipts = asyncHandler(async (req, res, next) => {
    req.query.createUser = req.userId;
    req.query.type = "Орлого";
    return this.getBills(req, res, next);
});

exports.getUserDrains = asyncHandler(async (req, res, next) => {
    req.query.createUser = req.userId;
    req.query.type = "Зарлага";
    return this.getBills(req, res, next);
});

exports.getBill = asyncHandler(async (req, res, next) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: bill,
  });
});

exports.createReceipt = asyncHandler(async (req, res, next) => {

  req.body.createUser = req.userId;
  req.body.type = "Орлого";
  const bill = await Bill.create(req.body);
  const transactions = await Transaction.find({createUser: req.userId, isBasket: false});


  for(let i = 0; i < transactions.length;  i++) {
    transactions[i].bill = bill.id
    transactions[i].type = bill.type
    transactions[i].incomeType = bill.incomeType
    transactions[i].isBasket = true
    if(transactions[i].finalPrice == undefined) {
      transactions[i].finalPrice = transactions[i].price * transactions[i].quantity
    }
    if(transactions[i].price == undefined) {
      transactions[i].price = transactions[i].finalPrice / transactions[i].quantity
    }
    transactions[i].save()

    const good = await Good.findById(transactions[i].good)
    good.quantity += transactions[i].quantity
    good.save()
  }


  res.status(200).json({
    success: true,
    data: bill,
  });
});

exports.createDrain = asyncHandler(async (req, res, next) => {

    req.body.createUser = req.userId;
    req.body.type = "Зарлага";
  
    const bill = await Bill.create(req.body);

    for(let i = 0; i < req.body.transactions.length;  i++) {
      req.body.transactions[i].bill = bill.id
      req.body.transactions[i].type = bill.type
      req.body.transactions[i].incomeType = bill.incomeType
      req.body.transactions[i].createUser = bill.createUser
      if(req.body.transactions[i].finalPrice == undefined) {
        req.body.transactions[i].finalPrice = req.body.transactions[i].price * req.body.transactions[i].quantity
      }
      if(req.body.transactions[i].price == undefined) {
        req.body.transactions[i].price = req.body.transactions[i].finalPrice / req.body.transactions[i].quantity
      }
      const transaction = await Transaction.create(req.body.transactions[i])
      bill.transactions[i].transactionId = transaction.id 
      bill.save()
      const good = await Good.findById(req.body.transactions[i].good)
      good.quantity -= req.body.transactions[i].quantity
      good.save()
    }
  
    res.status(200).json({
      success: true,
      data: bill,
    });
});

exports.deleteBill = asyncHandler(async (req, res, next) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  if (bill.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  const user = await User.findById(req.userId);

  bill.remove();

  res.status(200).json({
    success: true,
    data: bill,
    whoDeleted: user.name,
  });
});

exports.updateBill = asyncHandler(async (req, res, next) => {
  const bill = await Bill.findById(req.params.id);

  if (!bill) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (bill.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;


  bill.save();

  res.status(200).json({
    success: true,
    data: bill,
  });
});