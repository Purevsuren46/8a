const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getBills,
  getBill,
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
  .post(protect, authorize("admin", "operator"), createReceipt);

router
  .route("/drain")
  .get(protect, getUserDrains)
  .post(protect, authorize("admin", "operator"), createDrain);

router
  .route("/:id")
  
  .delete(protect, authorize("admin"), deleteBill)
  .put(protect, authorize("admin"), updateBill);




module.exports = router;
