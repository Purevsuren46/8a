const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../controller/templates");

// api/v1/templates/:id/goods


//"/api/v1/templates"
router
  .route("/")
  .get(getTemplates)
  .post(protect, createTemplate);

router
  .route("/:id")
  .get(getTemplate)
  .put(protect, updateTemplate)
  .delete(protect, deleteTemplate);

module.exports = router;
