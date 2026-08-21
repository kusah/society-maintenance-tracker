const express = require("express");
const {
    getAllComplaints,
    updateComplaint,
    getOverdueComplaints
} = require("../controllers/adminComplaintController");

const {
    requireAuth,
    requireRole
} = require("../middleware/auth");

const router = express.Router();

router.get(
    "/overdue",
    requireAuth,
    requireRole("admin"),
    getOverdueComplaints
);

router.patch(
    "/:id",
    requireAuth,
    requireRole("admin"),
    updateComplaint
);

module.exports = router;