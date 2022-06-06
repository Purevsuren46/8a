const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getTransactions,
  getTransaction,
  getUserTransactions,
  getBillTransactions,
  deleteTransaction,
  updateTransaction,
} = require("../controller/transactions");

const router = express.Router();

//"/api/v1/transactions"
router
  .route("/")
  .get(protect, getTransactions)

router
  .route("/user")
  .get(protect, getUserTransactions)

router
  .route("/:id")
  .get(protect, getTransaction)
  .delete(protect, authorize("admin"), deleteTransaction)
  .put(protect, authorize("admin"), updateTransaction);

router
  .route("/:id/bill")
  .get(protect, getBillTransactions)
  .delete(protect, authorize("admin"), deleteTransaction)
  .put(protect, authorize("admin"), updateTransaction);



module.exports = router;
