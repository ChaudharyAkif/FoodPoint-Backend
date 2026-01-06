import express from "express";
import { login, createMultipleCashiers, register, checkRole, forgotPassword, resetPassword, changePassword, updateCashier, deleteCashier, getCashierById, getAllCashiers } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import jwt from "jsonwebtoken";


const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);

// Superadmin-only
router.post("/create-multiple-cashiers", authMiddleware, roleMiddleware("superadmin"), createMultipleCashiers);
router.put("/change-password", authMiddleware, roleMiddleware("superadmin"), changePassword);

// Password & role
router.post("/forget-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/check-role", checkRole);  // make sure frontend sends { email } or valid body

router.get("/reset-password/verify/:token", (req, res) => {
  // console.log(req.params)
    try {
    const { token } = req.params;
    jwt.verify(token, process.env.JWT_SECRET!);
    return res.sendMessage(200, "Token is valid");
  } catch (err) {
    return res.sendMessage(400, "Invalid or expired token");
  }
});


// Cashier management (Superadmin only)
router.get(
  "/cashiers",
  authMiddleware,
  roleMiddleware("superadmin"),
  getAllCashiers
);

router.get(
  "/cashiers/:id",
  authMiddleware,
  roleMiddleware("superadmin"),
  getCashierById
);

router.put(
  "/cashiers/:id",
  authMiddleware,
  roleMiddleware("superadmin"),
  updateCashier
);

router.delete(
  "/cashiers/:id",
  authMiddleware,
  roleMiddleware("superadmin"),
  deleteCashier
);

export default router;
