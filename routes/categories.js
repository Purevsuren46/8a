const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/categories");

// api/v1/categories/:id/goods
const { getCategoryGoods } = require("../controller/goods");
router.route("/:categoryId/goods").get(getCategoryGoods);

//"/api/v1/categories"
router
  .route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

module.exports = router;
