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
  let goodLists = []
  let goodMargins = []
  let goodReceipts = []
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
        drainReceiptPrice: 0,
        allLeftBalanceReceiptPrice: 0,
        lastBalance: 0,
      }) 
      goodLists.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      goodMargins.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      goodReceipts.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
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
      let drainReceiptPrice = drainQuantity * receiptAveragePrice
      let allLeftBalanceReceiptPrice =  lastBalance * receiptAveragePrice
  
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
        drainReceiptPrice: drainReceiptPrice,
        allLeftBalanceReceiptPrice: allLeftBalanceReceiptPrice,
        lastBalance: lastBalance,
      })
      goodLists.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(receiptAveragePrice),
        Math.floor(drainQuantity),
        Math.floor(drainReceiptPrice),
        Math.floor(lastBalance),
        Math.floor(allLeftBalanceReceiptPrice),
        goods[i].id,
      ])
      goodMargins.push([
        goods[i].name,
        Math.floor(drainQuantity),
        Math.floor(drainFinalPrice),
        Math.floor(drainAveragePrice),
        Math.floor(allProfit),
        goods[i].id,
      ])
      goodReceipts.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(drainQuantity),
        Math.floor(drainFinalPrice),
        Math.floor(allProfit),
        Math.floor(lastBalance),
        Math.floor(allLeftBalanceReceiptPrice),
        goods[i].id,
      ])
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
    goodsLists: goodLists,
    goodsMargins: goodMargins,
    goodsReceipts: goodReceipts,
  });
});

exports.getAllByTimeProfit = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  req.query.sort = "createdAt"
  const sort = req.query.sort;
  const select = req.query.select;
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  

  const transactions = await Transaction.find({createUser: req.userId, isBasket: true, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})    
  .sort(sort)
  .limit(limit);

  const receipts = await Transaction.find({createUser: req.userId, type: "Орлого", isBasket: true, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})    
    .sort(sort)
    .limit(limit);

  const drains = await Transaction.find({createUser: req.userId, type: "Зарлага", isBasket: true, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})
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
  let goodLists = []
  let goodMargins = []
  let goodReceipts = []
  let transactionReport = []
  let salesForecastReport = []
  for (let i = 0; i < goods.length; i++) {
    req.query.sort = "createdAt"
    const sort = req.query.sort;
    const select = req.query.select;
    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
    
  
    const transactions = await Transaction.find({createUser: req.userId, isBasket: true, good: goods[i].id, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})    
    .sort(sort)
    .limit(limit);
  
    const receipts = await Transaction.find({createUser: req.userId, type: "Орлого", isBasket: true, good: goods[i].id, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})    
      .sort(sort)
      .limit(limit);
  
    const drains = await Transaction.find({createUser: req.userId, type: "Зарлага", isBasket: true, good: goods[i].id, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})
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
        drainReceiptPrice: 0,
        allLeftBalanceReceiptPrice: 0,
        lastBalance: 0,
      }) 
      goodLists.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      goodMargins.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      goodReceipts.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      transactionReport.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      salesForecastReport.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
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
      let drainReceiptPrice = drainQuantity * receiptAveragePrice
      let allLeftBalanceReceiptPrice =  lastBalance * receiptAveragePrice
  
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
        drainReceiptPrice: drainReceiptPrice,
        allLeftBalanceReceiptPrice: allLeftBalanceReceiptPrice,
        lastBalance: lastBalance,
      })
      goodLists.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(receiptAveragePrice),
        Math.floor(drainQuantity),
        Math.floor(drainReceiptPrice),
        Math.floor(lastBalance),
        Math.floor(allLeftBalanceReceiptPrice),
        goods[i].id,
      ])
      goodMargins.push([
        goods[i].name,
        Math.floor(receiptAveragePrice),
        Math.floor(drainQuantity),
        Math.floor(drainAveragePrice),
        Math.floor(drainFinalPrice),
        Math.floor(allProfit),
        goods[i].id,
      ])
      goodReceipts.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(drainQuantity),
        Math.floor(drainFinalPrice),
        Math.floor(allProfit),
        Math.floor(lastBalance),
        Math.floor(allLeftBalanceReceiptPrice),
        goods[i].id,
      ])
      transactionReport.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(drainQuantity),
        Math.floor(drainFinalPrice),
        goods[i].id,
      ])
      salesForecastReport.push([
        goods[i].name,
        Math.floor(lastBalance),
        Math.floor(receiptAveragePrice),
        Math.floor(lastBalance * receiptAveragePrice),
        Math.floor(drainAveragePrice),
        Math.floor(drainAveragePrice * lastBalance),
        Math.floor((drainAveragePrice * lastBalance) - (lastBalance * receiptAveragePrice)),
        goods[i].id,
      ])
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
    goodsLists: goodLists,
    goodsMargins: goodMargins,
    goodsReceipts: goodReceipts,
    transactionReport: transactionReport,
    salesForecastReport: salesForecastReport,
  });
});

exports.getAllCategoryProfit = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  req.query.sort = "createdAt"
  const sort = req.query.sort;
  const select = req.query.select;
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const good = []
  const goods = await Good.find({createUser: req.userId, category: req.params.id})
  for(let i = 0; i<goods.length; i++) {
    good.push(goods[i].id)
  }

  const transactions = await Transaction.find({createUser: req.userId, isBasket: true, good: good})    
  .sort(sort)
  .limit(limit);

  const receipts = await Transaction.find({createUser: req.userId, type: "Орлого", isBasket: true, good: good})    
    .sort(sort)
    .limit(limit);

  const drains = await Transaction.find({createUser: req.userId, type: "Зарлага", isBasket: true, good: good})
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

  let goodProfits = []
  let goodLists = []
  let goodMargins = []
  let goodReceipts = []
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
        drainReceiptPrice: 0,
        allLeftBalanceReceiptPrice: 0,
        lastBalance: 0,
      }) 
      goodLists.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      goodMargins.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      goodReceipts.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
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
      let drainReceiptPrice = drainQuantity * receiptAveragePrice
      let allLeftBalanceReceiptPrice =  lastBalance * receiptAveragePrice
  
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
        drainReceiptPrice: drainReceiptPrice,
        allLeftBalanceReceiptPrice: allLeftBalanceReceiptPrice,
        lastBalance: lastBalance,
      })
      goodLists.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(receiptAveragePrice),
        Math.floor(drainQuantity),
        Math.floor(drainReceiptPrice),
        Math.floor(lastBalance),
        Math.floor(allLeftBalanceReceiptPrice),
        goods[i].id,
      ])
      goodMargins.push([
        goods[i].name,
        Math.floor(drainQuantity),
        Math.floor(drainFinalPrice),
        Math.floor(drainAveragePrice),
        Math.floor(allProfit),
        goods[i].id,
      ])
      goodReceipts.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(drainQuantity),
        Math.floor(drainFinalPrice),
        Math.floor(allProfit),
        Math.floor(lastBalance),
        Math.floor(allLeftBalanceReceiptPrice),
        goods[i].id,
      ])
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
    goodsLists: goodLists,
    goodsMargins: goodMargins,
    goodsReceipts: goodReceipts,
  });
});

exports.getAllCategoryByTimeProfit = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  req.query.sort = "createdAt"
  const sort = req.query.sort;
  const select = req.query.select;
  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
  const good = []
  const goods = await Good.find({createUser: req.userId, category: req.params.id})
  for(let i = 0; i<goods.length; i++) {
    good.push(goods[i].id)
  }

  const transactions = await Transaction.find({createUser: req.userId, isBasket: true, good: good, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})    
  .sort(sort)
  .limit(limit);

  const receipts = await Transaction.find({createUser: req.userId, type: "Орлого", isBasket: true, good: good, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})    
    .sort(sort)
    .limit(limit);

  const drains = await Transaction.find({createUser: req.userId, type: "Зарлага", isBasket: true, good: good, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})
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

  let goodProfits = []
  let goodLists = []
  let goodMargins = []
  let goodReceipts = []
  let transactionReport = []
  let salesForecastReport = []
  for (let i = 0; i < goods.length; i++) {
    req.query.sort = "createdAt"
    const sort = req.query.sort;
    const select = req.query.select;
    ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);
    
  
    const transactions = await Transaction.find({createUser: req.userId, isBasket: true, good: goods[i].id, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})    
    .sort(sort)
    .limit(limit);
  
    const receipts = await Transaction.find({createUser: req.userId, type: "Орлого", isBasket: true, good: goods[i].id, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})    
      .sort(sort)
      .limit(limit);
  
    const drains = await Transaction.find({createUser: req.userId, type: "Зарлага", isBasket: true, good: goods[i].id, createdAt: {$gte: new Date(req.body.date1), $lte: new Date(req.body.date2)}})
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
        drainReceiptPrice: 0,
        allLeftBalanceReceiptPrice: 0,
        lastBalance: 0,
      }) 
      goodLists.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      goodMargins.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      goodReceipts.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      transactionReport.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
      salesForecastReport.push([
        goods[i].name,
        0,
        0,
        0,
        0,
        0,
        0,
        goods[i].id,
      ])
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
      let drainReceiptPrice = drainQuantity * receiptAveragePrice
      let allLeftBalanceReceiptPrice =  lastBalance * receiptAveragePrice
  
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
        drainReceiptPrice: drainReceiptPrice,
        allLeftBalanceReceiptPrice: allLeftBalanceReceiptPrice,
        lastBalance: lastBalance,
      })
      goodLists.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(receiptAveragePrice),
        Math.floor(drainQuantity),
        Math.floor(drainReceiptPrice),
        Math.floor(lastBalance),
        Math.floor(allLeftBalanceReceiptPrice),
        goods[i].id,
      ])
      goodMargins.push([
        goods[i].name,
        Math.floor(receiptAveragePrice),
        Math.floor(drainQuantity),
        Math.floor(drainAveragePrice),
        Math.floor(drainFinalPrice),
        Math.floor(allProfit),
        goods[i].id,
      ])
      goodReceipts.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(drainQuantity),
        Math.floor(drainFinalPrice),
        Math.floor(allProfit),
        Math.floor(lastBalance),
        Math.floor(allLeftBalanceReceiptPrice),
        goods[i].id,
      ])
      transactionReport.push([
        goods[i].name,
        Math.floor(receiptQuantity),
        Math.floor(receiptFinalPrice),
        Math.floor(drainQuantity),
        Math.floor(drainFinalPrice),
        goods[i].id,
      ])
      salesForecastReport.push([
        goods[i].name,
        Math.floor(lastBalance),
        Math.floor(receiptAveragePrice),
        Math.floor(lastBalance * receiptAveragePrice),
        Math.floor(drainAveragePrice),
        Math.floor(drainAveragePrice * lastBalance),
        Math.floor((drainAveragePrice * lastBalance) - (lastBalance * receiptAveragePrice)),
        goods[i].id,
      ])
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
    goodsLists: goodLists,
    goodsMargins: goodMargins,
    goodsReceipts: goodReceipts,
    transactionReport: transactionReport,
    salesForecastReport: salesForecastReport,
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