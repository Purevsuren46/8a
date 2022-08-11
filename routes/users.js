const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  register,
  login,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  logout,
} = require("../controller/users");

const { getUserGoods } = require("../controller/goods");

const router = express.Router();

//"/api/v1/users"
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router
  .route("/")
  .get(protect, getUsers)
  .post( createUser);
router.use(protect);

//"/api/v1/users"


router
  .route("/:id")
  .get(getUser)
  .put( updateUser)
  .delete( deleteUser);

router
  .route("/:id/goods")
  .get( getUserGoods);


module.exports = router;
