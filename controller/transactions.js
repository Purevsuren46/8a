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
      select: "name photo",
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

exports.createTransaction = asyncHandler(async (req, res, next) => {
  req.body.createUser = req.userId
  const transaction = await Transaction.create(req.body);

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

exports.getUserTransactions = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getTransactions(req, res, next);
});

exports.getLoanTransactions = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  req.query.incomeType = "Зээл";
  return this.getTransactions(req, res, next);
});

exports.getGoodTransactions = asyncHandler(async (req, res, next) => {
  // req.query.createUser = req.userId;
  req.query.good = req.params.id;
  return this.getTransactions(req, res, next);
});

exports.getAllProfit = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  req.query.sort = "createdAt"
  const sort = req.query.sort;
  const select = req.query.select;
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  

  const transactions = await Transaction.find({createUser: req.userId, isBasket: true})    
  .sort(sort)
  .limit(limit);

  const receipts = await Transaction.find({createUser: req.userId, type: "Орлого", isBasket: true})    
    .sort(sort)
    .limit(limit);

  const drains = await Transaction.find({createUser: req.userId, type: "Зарлага", isBasket: true})
    .sort(sort)
    .limit(limit);
    
  if(transactions.length == 0) {
    throw new MyError("Бараанд борлуулалтын түүх алга", 404);
  }
  let last = 0
  if(transactions[0].type == "Орлого") {
    last = transactions[0].balanceGoodNumber - transactions[0].quantity
  } else {
    last = transactions[0].balanceGoodNumber + transactions[0].quantity
  }
  
  let receiptFinalPrice = 0
  let receiptQuantity = 0
  for (let i = 0; i < receipts.length; i++) {
    receiptFinalPrice += receipts[i].finalPrice
    receiptQuantity += receipts[i].quantity
  }
  let drainFinalPrice = 0
  let drainQuantity = 0

  for (let i = 0; i < drains.length; i++) {
    drainFinalPrice += drains[i].finalPrice
    drainQuantity += drains[i].quantity
  }
  let receiptAveragePrice = receiptFinalPrice / receiptQuantity
  let drainAveragePrice = drainFinalPrice / drainQuantity
  let oneProfit = drainAveragePrice - receiptAveragePrice
  let allProfit = oneProfit * drainQuantity
  let lastBalance = transactions[transactions.length - 1].balanceGoodNumber

  const goods = await Good.find({createUser: req.userId})
  let goodProfits = []
  for (let i = 0; i < goods.length; i++) {
    req.query.sort = "createdAt"
    const sort = req.query.sort;
    const select = req.query.select;
    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
    
  
    const transactions = await Transaction.find({createUser: req.userId, isBasket: true, good: goods[i].id})    
    .sort(sort)
    .limit(limit);
  
    const receipts = await Transaction.find({createUser: req.userId, type: "Орлого", isBasket: true, good: goods[i].id})    
      .sort(sort)
      .limit(limit);
  
    const drains = await Transaction.find({createUser: req.userId, type: "Зарлага", isBasket: true, good: goods[i].id})
      .sort(sort)
      .limit(limit);
      
    if(transactions.length == 0) {
      goodProfits.push({
        good: goods[i].name,
        firstBalance: 0,
        receiptQuantity: 0,
        receiptAveragePrice: 0,
        receiptFinalPrice: 0,
        drainQuantity: 0,
        drainAveragePrice: 0,
        drainFinalPrice: 0,
        oneProfit: 0,
        allProfit: 0,
        lastBalance: 0,
      }) 
    } else {
      let last = 0
      if(transactions[0].type == "Орлого") {
        last = transactions[0].balanceGoodNumber - transactions[0].quantity
      } else {
        last = transactions[0].balanceGoodNumber + transactions[0].quantity
      }
      
      let receiptFinalPrice = 0
      let receiptQuantity = 0
      for (let i = 0; i < receipts.length; i++) {
        receiptFinalPrice += receipts[i].finalPrice
        receiptQuantity += receipts[i].quantity
      }
      let drainFinalPrice = 0
      let drainQuantity = 0
    
      for (let i = 0; i < drains.length; i++) {
        drainFinalPrice += drains[i].finalPrice
        drainQuantity += drains[i].quantity
      }
      let receiptAveragePrice = receiptFinalPrice / receiptQuantity
      let drainAveragePrice = drainFinalPrice / drainQuantity
      let oneProfit = drainAveragePrice - receiptAveragePrice
      let allProfit = oneProfit * drainQuantity
      let lastBalance = transactions[transactions.length - 1].balanceGoodNumber
  
      goodProfits.push({
        good: goods[i].name,
        firstBalance: last,
        receiptQuantity: receiptQuantity,
        receiptAveragePrice: receiptAveragePrice,
        receiptFinalPrice: receiptFinalPrice,
        drainQuantity: drainQuantity,
        drainAveragePrice: drainAveragePrice,
        drainFinalPrice: drainFinalPrice,
        oneProfit: oneProfit,
        allProfit: allProfit,
        lastBalance: lastBalance,
      })
    }

  }

  res.status(200).json({
    success: true,
    firstBalance: last,
    receiptQuantity: receiptQuantity,
    receiptAveragePrice: receiptAveragePrice,
    receiptFinalPrice: receiptFinalPrice,
    drainQuantity: drainQuantity,
    drainAveragePrice: drainAveragePrice,
    drainFinalPrice: drainFinalPrice,
    oneProfit: oneProfit,
    allProfit: allProfit,
    lastBalance: lastBalance,
    goodsProfits: goodProfits,
  });
});

exports.getAllGoodProfit = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  req.query.sort = "createdAt"
  const sort = req.query.sort;
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  if(!req.params.id) {
    throw new MyError("Бараагаа оруул", 404);
  }
  

  const transactions = await Transaction.find({createUser: req.userId, isBasket: true, good: req.params.id})    
  .sort(sort)
  .limit(limit);

  const receipts = await Transaction.find({createUser: req.userId, type: "Орлого", isBasket: true, good: req.params.id})    
    .sort(sort)
    .limit(limit);

  const drains = await Transaction.find({createUser: req.userId, type: "Зарлага", isBasket: true, good: req.params.id})
    .sort(sort)
    .limit(limit);

  if(transactions.length == 0) {
    throw new MyError("Бараанд борлуулалтын түүх алга", 404);
  }
  let last = 0
  if(transactions[0].type == "Орлого") {
    last = transactions[0].balanceGoodNumber - transactions[0].quantity
  } else {
    last = transactions[0].balanceGoodNumber + transactions[0].quantity
  }
  
  let receiptFinalPrice = 0
  let receiptQuantity = 0
  for (let i = 0; i < receipts.length; i++) {
    receiptFinalPrice += receipts[i].finalPrice
    receiptQuantity += receipts[i].quantity
  }
  let drainFinalPrice = 0
  let drainQuantity = 0

  for (let i = 0; i < drains.length; i++) {
    drainFinalPrice += drains[i].finalPrice
    drainQuantity += drains[i].quantity
  }
  let receiptAveragePrice = receiptFinalPrice / receiptQuantity
  let drainAveragePrice = drainFinalPrice / drainQuantity
  let oneProfit = drainAveragePrice - receiptAveragePrice
  let allProfit = oneProfit * drainQuantity
  let lastBalance = transactions[transactions.length - 1].balanceGoodNumber




  res.status(200).json({
    success: true,
    firstBalance: last,
    receiptQuantity: receiptQuantity,
    receiptAveragePrice: receiptAveragePrice,
    receiptFinalPrice: receiptFinalPrice,
    drainQuantity: drainQuantity,
    drainAveragePrice: drainAveragePrice,
    drainFinalPrice: drainFinalPrice,
    oneProfit: oneProfit,
    allProfit: allProfit,
    lastBalance: lastBalance,
  });
});

exports.getUserIsBasketTransactions = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  req.query.isBasket = false;
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
  const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!transaction) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }



  res.status(200).json({
    success: true,
    data: transaction,
  });
});