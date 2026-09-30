const express = require("express");
const router = express.Router();
const { authMiddleware, requireAdmin } = require("../authmiddleware");
const {
  register,
  login,
  verifyEmail,
  getUserByID,
  editUser,
  getAllUsers,
  deleteUser,
  logout,
  getMe,
} = require("../controller/userController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.get("/verify/:token", verifyEmail);
router.get("/user/:id", authMiddleware, getUserByID);
router.put("/edit/:id", authMiddleware, editUser);
router.get("/all", authMiddleware, requireAdmin, getAllUsers);
router.delete("/delete/:id", authMiddleware, deleteUser);

module.exports = router;