const Template = require("../models/Template");
const Transaction = require("../models/Transaction");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

exports.getTemplates = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sort = req.query.sort;
  const select = req.query.select;

  ["select", "sort", "page", "limit"].forEach((el) => delete req.query[el]);

  const pagination = await paginate(page, limit, Template);

  const templates = await Template.find(req.query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: templates,
    pagination,
  });
});

exports.getTemplate = asyncHandler(async (req, res, next) => {


  const template = await Template.findById(req.params.id).populate("books");

  if (!template) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүй!", 400);
  }

  res.status(200).json({
    success: true,
    data: template,
  });
});

exports.createTemplate = asyncHandler(async (req, res, next) => {
    req.body.createUser = req.userId
  const template = await Template.create(req.body);
  const transactions = await Transaction.find({createUser: req.userId, isBasket: false});
  for(let i = 0; i < transactions.length;  i++) {
    transactions[i].template = template.id
    transactions[i].templateName = template.name
    transactions[i].isBasket = true
    transactions[i].save()
  }


  res.status(200).json({
    success: true,
    data: template,
  });
});

exports.updateTemplate = asyncHandler(async (req, res, next) => {
  const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!template) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүйээээ.", 400);
  }

  res.status(200).json({
    success: true,
    data: template,
  });
});

exports.deleteTemplate = asyncHandler(async (req, res, next) => {
  const template = await Template.findById(req.params.id);

  if (!template) {
    throw new MyError(req.params.id + " ID-тэй категори байхгүйээээ.", 400);
  }

  template.remove();

  res.status(200).json({
    success: true,
    data: template,
  });
});
