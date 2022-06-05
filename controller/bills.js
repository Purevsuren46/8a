const Bill = require("../models/Bill");
const path = require("path");
const Category = require("../models/Category");
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
      path: "category",
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
  const category = await Category.findById(req.body.category);

  if (!category) {
    throw new MyError(req.body.category + " ID-тэй категори байхгүй!", 400);
  }

  req.body.createUser = req.userId;
  req.body.type = "Орлого";

  const bill = await Bill.create(req.body);

  res.status(200).json({
    success: true,
    data: bill,
  });
});

exports.createDrain = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.body.category);
  
    if (!category) {
      throw new MyError(req.body.category + " ID-тэй категори байхгүй!", 400);
    }
  
    req.body.createUser = req.userId;
    req.body.type = "Зарлага";
  
    const bill = await Bill.create(req.body);
  
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