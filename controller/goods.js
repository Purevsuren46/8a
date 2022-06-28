const Good = require("../models/Good");
const path = require("path");
const sharp = require("sharp");
const Category = require("../models/Category");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// api/v1/goods
exports.getGoods = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Good);

  const goods = await Good.find(req.query, select)
    .populate({path: "category", select: "name"})
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: goods.length,
    data: goods,
    pagination,
  });
});

exports.getUserGoods = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getGoods(req, res, next);
});

// api/v1/categories/:catId/goods
exports.getCategoryGoods = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 2;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Good);

  //req.query, select
  const goods = await Good.find(
    { ...req.query, category: req.params.categoryId },
    select
  )
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: goods.length,
    data: goods,
    pagination,
  });
});

exports.getGood = asyncHandler(async (req, res, next) => {
  const good = await Good.findById(req.params.id).populate({path: "category", select: "name"});

  if (!good) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: good,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.createGood = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.body.category);

  if (!category) {
    throw new MyError(req.body.category + " ID-тэй категори байхгүй!", 400);
  }

  req.body.createUser = req.userId;

  const good = await Good.create(req.body);

  res.status(200).json({
    success: true,
    data: good,
  });
});

exports.deleteGood = asyncHandler(async (req, res, next) => {
  const good = await Good.findById(req.params.id);

  if (!good) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  // if (good.createUser.toString() !== req.userId && req.userRole !== "admin") {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }
  const transactions = await Transaction.findAndDelete

  const user = await User.findById(req.userId);

  good.remove();

  res.status(200).json({
    success: true,
    data: good,
    whoDeleted: user.name,
  });
});

exports.updateGood = asyncHandler(async (req, res, next) => {
  const good = await Good.findById(req.params.id);

  if (!good) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }

  if (good.createUser.toString() !== req.userId && req.userRole !== "admin") {
    throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  }

  req.body.updateUser = req.userId;

  for (let attr in req.body) {
    good[attr] = req.body[attr];
  }

  good.save();

  res.status(200).json({
    success: true,
    data: good,
  });
});

// PUT:  api/v1/goods/:id/photo
exports.uploadGoodPhoto = asyncHandler(async (req, res, next) => {
  const good = await Good.findById(req.params.id);

  if (!good) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээ.", 400);
  }

  // image upload

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    throw new MyError("Та зураг upload хийнэ үү.", 400);
  }


  file.name = `photo_${req.params.id}${path.parse(file.name).ext}`;

  const picture = await sharp(file.data).resize({width: parseInt(process.env.FILE_SIZE)}).toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);

  good.photo = file.name;
  good.save();

  res.status(200).json({
    success: true,
    data: file.name,
  });
});
