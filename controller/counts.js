const Count = require("../models/Count");
const Category = require("../models/Category");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// api/v1/counts
exports.getCounts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Count);

  const counts = await Count.find(req.query, select)
    .populate({path: "category", select: "name"})
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);



  res.status(200).json({
    success: true,
    count: counts.length,
    data: counts,
    pagination,
  });
});

exports.getUserCounts = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getCounts(req, res, next);
});

// api/v1/categories/:catId/counts
exports.getCountsByTime = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Count);

  //req.query, select
  const counts = await Count.find(
    { ...req.query, category: req.params.categoryId },
    select
  )
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: counts.length,
    data: counts,
    pagination,
  });
});

exports.getCount = asyncHandler(async (req, res, next) => {
  const count = await Count.findById(req.params.id).populate({path: "category", select: "name"});

  if (!count) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: count,
  });
});

exports.createCount = asyncHandler(async (req, res, next) => {

  const category = await Count.findOne({good: req.body.good, countName: req.body.countName});

  if (!category) {
    req.body.createUser = req.userId;

    const count = await Count.create(req.body);
    res.status(200).json({
        success: true,
        data: count,
      });
  } else {
    category.count += 1
    category.save()
    res.status(200).json({
        success: true,
        data: category,
      });
  }
});

exports.deleteCount = asyncHandler(async (req, res, next) => {
  const count = await Count.findById(req.params.id);

  if (!count) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  // if (count.createUser.toString() !== req.userId && req.userRole !== "admin") {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }
  const transactions = await Transaction.findAndDelete

  const user = await User.findById(req.userId);

  count.remove();

  res.status(200).json({
    success: true,
    data: count,
    whoDeleted: user.name,
  });
});

exports.updateCount = asyncHandler(async (req, res, next) => {
  const count = await Count.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!count) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }






  count.save();

  res.status(200).json({
    success: true,
    data: count,
  });
});

