const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getBarcodes,
  getBarcode,
  getUserBarcodes,
  createBarcode,
  deleteBarcode,
  updateBarcode,
} = require("../controller/barcodes");

const router = express.Router();

//"/api/v1/barcodes"
router
  .route("/")
  .get(getBarcodes)
  .post(protect, createBarcode);

router
  .route("/user")
  .get(protect, getUserBarcodes)

router
  .route("/:id")
  .get(getBarcode)
  .delete(protect, deleteBarcode)
  .put(protect, updateBarcode);




module.exports = router;