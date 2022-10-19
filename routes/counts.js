const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getCounts,
  getCount,
  getUserCounts,
  createCount,
  deleteCount,
  updateCount,
} = require("../controller/counts");

const router = express.Router();

//"/api/v1/counts"
router
  .route("/")
  .get(getCounts)
  .post(protect, createCount);

router
  .route("/user")
  .get(protect, getUserCounts)

router
  .route("/:id")
  .get(getCount)
  .delete(protect, deleteCount)
  .put(protect, updateCount);




module.exports = router;