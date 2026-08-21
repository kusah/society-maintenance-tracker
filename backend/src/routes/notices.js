const express = require("express");

const {
    createNotice,
    getNotices
} = require("../controllers/noticeController");

const {
    requireAuth,
    requireRole
} = require("../middleware/auth");

const router = express.Router();


// Admin creates notice
router.post(
    "/",
    requireAuth,
    requireRole("admin"),
    createNotice
);


// Residents can view notices
router.get(
    "/",
    requireAuth,
    getNotices
);


module.exports = router;