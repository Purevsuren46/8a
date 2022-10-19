const Barcode = require("../models/Barcode");
const Category = require("../models/Category");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// api/v1/barcodes
exports.getBarcodes = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Barcode);

  const barcodes = await Barcode.find(req.query, select)
    .populate({path: "category", select: "name"})
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);



  res.status(200).json({
    success: true,
    barcode: barcodes.length,
    data: barcodes,
    pagination,
  });
});

exports.getUserBarcodes = asyncHandler(async (req, res, next) => {
  req.query.createUser = req.userId;
  return this.getBarcodes(req, res, next);
});


exports.getBarcode = asyncHandler(async (req, res, next) => {
  const barcode = await Barcode.findById(req.params.id).populate({path: "category", select: "name"});

  if (!barcode) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  res.status(200).json({
    success: true,
    data: barcode,
  });
});

exports.createBarcode = asyncHandler(async (req, res, next) => {

  const category = await Barcode.findOne({barcode: req.body.barcode});
    console.log(category)
  if (!category) {
    req.body.createUser = req.userId;

    const barcode = await Barcode.create(req.body);
    res.status(200).json({
        success: true,
        data: barcode,
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

exports.deleteBarcode = asyncHandler(async (req, res, next) => {
  const barcode = await Barcode.findById(req.params.id);

  if (!barcode) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүй байна.", 404);
  }

  // if (barcode.createUser.toString() !== req.userId && req.userRole !== "admin") {
  //   throw new MyError("Та зөвхөн өөрийнхөө номыг л засварлах эрхтэй", 403);
  // }
  const transactions = await Transaction.findAndDelete

  const user = await User.findById(req.userId);

  barcode.remove();

  res.status(200).json({
    success: true,
    data: barcode,
    whoDeleted: user.name,
  });
});

exports.updateBarcode = asyncHandler(async (req, res, next) => {
  const barcode = await Barcode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!barcode) {
    throw new MyError(req.params.id + " ID-тэй ном байхгүйээээ.", 400);
  }






  barcode.save();

  res.status(200).json({
    success: true,
    data: barcode,
  });
});

