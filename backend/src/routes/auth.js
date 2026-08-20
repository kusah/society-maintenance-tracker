const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const {
    requireAuth,
    requireRole
} = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    });
});

router.get(
    "/resident-test",
    requireAuth,
    requireRole("resident"),
    (req, res) => {
        res.json({
            message: "Resident access granted",
            user: req.user
        });
    }
);

router.get(
    "/admin-test",
    requireAuth,
    requireRole("admin"),
    (req, res) => {
        res.json({
            message: "Admin access granted",
            user: req.user
        });
    }
);

module.exports = router;