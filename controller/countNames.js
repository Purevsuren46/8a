const CountName = require("../models/CountName");
const Category = require("../models/Category");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// api/v1/countNames
exports.getCountNames = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, CountName);

  const countNames = await CountName.find(req.query, select)
    .populate({path: "category", select: "name"})
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);



  res.status(200).json({
    success: true,
    count: countNames.length,
    data: countNames,
    pagination,
  });
});

exports.getUserCountNames = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getCountNames(req, res, next);
});

// api/v1/categories/:catId/countNames


exports.getCountName = asyncHandler(async (req, res, next) => {
  const countName = await CountName.findById(req.params.id).populate({path: "category", select: "name"});

  if (!countName) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: countName,
  });
});

exports.createCountName = asyncHandler(async (req, res, next) => {

    req.body.createUser = req.userId;
    const wallet = await CountName.create(req.body)

    res.status(200).json({ success: true, data: wallet, })
});

exports.deleteCountName = asyncHandler(async (req, res, next) => {
  const countName = await CountName.findById(req.params.id);

  if (!countName) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  // if (countName.createUser.toString() !== req.userId && req.userRole !== "admin") {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }
  const transactions = await Transaction.findAndDelete

  const user = await User.findById(req.userId);

  countName.remove();

  res.status(200).json({
    success: true,
    data: countName,
    whoDeleted: user.name,
  });
});

exports.updateCountName = asyncHandler(async (req, res, next) => {
  const countName = await CountName.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!countName) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }






  countName.save();

  res.status(200).json({
    success: true,
    data: countName,
  });
});

