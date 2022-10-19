const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  getCountNames,
  getCountName,
  getUserCountNames,
  createCountName,
  deleteCountName,
  updateCountName,
} = require("../controller/countNames");

const router = express.Router();

//"/api/v1/countNames"
router
  .route("/")
  .get(getCountNames)
  .post(protect, createCountName);

router
  .route("/user")
  .get(protect, getUserCountNames)

router
  .route("/:id")
  .get(getCountName)
  .delete(protect, deleteCountName)
  .put(protect, updateCountName);




module.exports = router;