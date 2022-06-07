const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getGoods,
  getGood,
  getUserGoods,
  createGood,
  deleteGood,
  updateGood,
  uploadGoodPhoto,
} = require("../controller/goods");

const router = express.Router();

//"/api/v1/goods"
router
  .route("/")
  .get(getGoods)
  .post(protect, createGood);

router
  .route("/user")
  .get(protect, getUserGoods)

router
  .route("/:id")
  .get(getGood)
  .delete(protect, deleteGood)
  .put(protect, updateGood);

router
  .route("/:id/upload-photo")
  .put(protect, uploadGoodPhoto);


module.exports = router;
