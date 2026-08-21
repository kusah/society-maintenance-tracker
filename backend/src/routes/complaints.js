const express = require("express");

const {
    createComplaint,
    getMyComplaints,
    getComplaintHistory
} = require("../controllers/complaintController");

const {
    requireAuth,
    requireRole
} = require("../middleware/auth");

const router = express.Router();
const upload = require("../middleware/upload");
router.post(
    "/",
    requireAuth,
    requireRole("resident"),
    upload.single("photo"),
    createComplaint
);

router.get(
    "/me",
    requireAuth,
    requireRole("resident"),
    getMyComplaints
);

router.get(
    "/:id/history",
    requireAuth,
    requireRole("resident"),
    getComplaintHistory
);

module.exports = router;