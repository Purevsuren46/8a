const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getBills,
  getBill,
  createReceipt,
  createDrain,
  deleteBill,
  updateBill,
} = require("../controller/bills");

const router = express.Router();

//"/api/v1/bills"
router
  .route("/receipt")
  .get(getBills)
  .post(protect, authorize("admin", "operator"), createReceipt);

  router
  .route("/drain")
  .get(getBills)
  .post(protect, authorize("admin", "operator"), createDrain);

router
  .route("/:id")
  .get(getBill)
  .delete(protect, authorize("admin"), deleteBill)
  .put(protect, authorize("admin"), updateBill);




module.exports = router;
