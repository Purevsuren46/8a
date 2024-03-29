const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getBills,
  getBill,
  createDebtPayment,
  deleteDebtPayment,
  updateDebtPayment,
  getUserBills,
  getUserDebts,
  getUserReceipts,
  getUserDrains,
  createReceipt,
  createDrain,
  deleteBill,
  updateBill,
} = require("../controller/bills");

const router = express.Router();

//"/api/v1/bills"
router
  .route("/")
  .get(protect, getBills)

router
  .route("/receipt")
  .get(protect, getUserReceipts)
  .post(protect, createReceipt);

router
  .route("/drain")
  .get(protect, getUserDrains)
  .post(protect, createDrain);

router
  .route("/debt")
  .get(protect, getUserDebts)

router
  .route("/debt/:id")
  .post(protect, createDebtPayment)

router
  .route("/debt/:id/:id2")
  .put(protect, updateDebtPayment)
  .delete(protect, deleteDebtPayment)

router
  .route("/user")
  .get(protect, getUserBills)

router
  .route("/:id")
  .get(protect, getBill)
  .delete(protect, deleteBill)
  .put(protect, updateBill);




module.exports = router;
