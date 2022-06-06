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
  .post(protect, authorize("admin", "operator"), createGood);

router
  .route("/user")
  .get(protect, getUserGoods)

router
  .route("/:id")
  .get(getGood)
  .delete(protect, authorize("admin"), deleteGood)
  .put(protect, authorize("admin"), updateGood);

router
  .route("/:id/upload-photo")
  .put(protect, authorize("admin"), uploadGoodPhoto);


module.exports = router;
