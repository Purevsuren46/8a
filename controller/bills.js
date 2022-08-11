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
  const user = await User.findById(req.userId)
  user.billNumber += 1
  user.save()
  const date = bill.createdAt.toLocaleDateString("en-US").split("/")
  bill.number = `O${date[2].substring(2,4)}${date[0].toString().padStart(2, '0')}${user.billNumber.toString().padStart(4, '0')}`

  if(req.body.template) {
    const transaction = await Transaction.find({template: req.body.template});
    if (!transaction) {
      throw new MyError(req.body.template + " ID-тэй template байхгүй байна.", 404);
    }

    for(let i = 0; i < transaction.length;  i++) {
      if(transaction[i].finalPrice == undefined) {
        transaction[i].finalPrice = transaction[i].price * transaction[i].quantity
      }
      if(transaction[i].price == undefined) {
        transaction[i].price = transaction[i].finalPrice / transaction[i].quantity
      }
      req.body.good = transaction[i].good
      req.body.price = transaction[i].price
      req.body.quantity = transaction[i].quantity
      req.body.createUser = transaction[i].createUser
      req.body.finalPrice = transaction[i].finalPrice
      delete req.body.template
      const transactions = await Transaction.create(req.body)

      transactions.bill = bill.id
      transactions.type = bill.type
      transactions.incomeType = bill.incomeType
      transactions.isBasket = true


  
      const good = await Good.findById(transactions.good)
      good.quantity += transactions.quantity
      good.receipt += transactions.quantity
      transactions.balanceGoodNumber = good.quantity
      good.save()
      transactions.save()
    }
    for(let i = 0; i < transaction.length;  i++) {
      bill.finalPrice += transaction[i].finalPrice
    }
    bill.save()
  
  
    res.status(200).json({
      success: true,
      data: bill,
    });
  } else {
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
  
      const good = await Good.findById(transactions[i].good)
      good.quantity += transactions[i].quantity
      good.receipt += transactions[i].quantity
      transactions[i].balanceGoodNumber = good.quantity
      good.save()
      transactions[i].save()
    }
    for(let i = 0; i < transactions.length;  i++) {
      bill.finalPrice += transactions[i].finalPrice
    }
    bill.save()
  
  
    res.status(200).json({
      success: true,
      data: bill,
    });
  }


});

exports.createDrain = asyncHandler(async (req, res, next) => {

  req.body.createUser = req.userId;
  req.body.type = "Зарлага";

  const transactions = await Transaction.find({createUser: req.userId, isBasket: false});

  for(let i = 0; i < transactions.length;  i++) {
    const good = await Good.findById(transactions[i].good)
    if(good.quantity < transactions[i].quantity) {
      throw new MyError("Зарлагын тоо бүтээгдэхүүний тооноос их байна", 400);
    }
  }
  
  const bill = await Bill.create(req.body);
  const user = await User.findById(req.userId)
  user.billNumber -= 1
  user.save()
  const date = bill.createdAt.toLocaleDateString("en-US").split("/")
  bill.number = `Z${date[2].substring(2,4)}${date[0].toString().padStart(2, '0')}${user.billNumber.toString().padStart(4, '0')}`

  if(req.body.template) {
    const transaction = await Transaction.find({template: req.body.template});
    if (!transaction) {
      throw new MyError(req.body.template + " ID-тэй template байхгүй байна.", 404);
    }

    for(let i = 0; i < transaction.length;  i++) {
      if(transaction[i].finalPrice == undefined) {
        transaction[i].finalPrice = transaction[i].price * transaction[i].quantity
      }
      if(transaction[i].price == undefined) {
        transaction[i].price = transaction[i].finalPrice / transaction[i].quantity
      }
      req.body.good = transaction[i].good
      req.body.price = transaction[i].price
      req.body.quantity = transaction[i].quantity
      req.body.createUser = transaction[i].createUser
      req.body.finalPrice = transaction[i].finalPrice
      delete req.body.template
      const transactions = await Transaction.create(req.body)

      transactions.bill = bill.id
      transactions.type = bill.type
      transactions.incomeType = bill.incomeType
      transactions.isBasket = true


  
      const good = await Good.findById(transactions.good)
      good.quantity -= transactions.quantity
      good.drain += transactions.quantity
      transactions.balanceGoodNumber = good.quantity
      good.save()
      transactions.save()
    }
    for(let i = 0; i < transaction.length;  i++) {
      bill.finalPrice += transaction[i].finalPrice
    }
    bill.save()
  
  
    res.status(200).json({
      success: true,
      data: bill,
    });
  } else {
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
  
      const good = await Good.findById(transactions[i].good)
      good.quantity -= transactions[i].quantity
      good.drain += transactions[i].quantity
      transactions[i].balanceGoodNumber = good.quantity
      good.save()
      transactions[i].save()
    }
    for(let i = 0; i < transactions.length;  i++) {
      bill.finalPrice -= transactions[i].finalPrice
    }
    bill.save()
  
  
    res.status(200).json({
      success: true,
      data: bill,
    });
  }


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