const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getTransactions,
  getTransaction,
  createTransaction,
  getUserTransactions,
  getGoodTransactions,
  getUserIsBasketTransactions,
  getBillTransactions,
  deleteTransaction,
  updateTransaction,
} = require("../controller/transactions");

const router = express.Router();

//"/api/v1/transactions"
router
  .route("/")
  .get(protect, getTransactions)
  .post(protect, createTransaction)

router
  .route("/user")
  .get(protect, getUserTransactions)

router
  .route("/:id/good")
  .get(protect, getGoodTransactions)

router
  .route("/basket")
  .get(protect, getUserIsBasketTransactions)

router
  .route("/:id")
  .get(protect, getTransaction)
  .delete(protect, deleteTransaction)
  .put(protect, updateTransaction);

router
  .route("/:id/bill")
  .get(protect, getBillTransactions)




module.exports = router;
