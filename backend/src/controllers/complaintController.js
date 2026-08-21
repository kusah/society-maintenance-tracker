const pool = require("../models/db");

const createComplaint = async (req, res) => {
    try {
        const { category, description } = req.body;

        // Validate input
        if (!category || !description) {
            return res.status(400).json({
                message: "Category and description are required"
            });
        }

        // Only residents can create complaints
        if (req.user.role !== "resident") {
            return res.status(403).json({
                message: "Only residents can create complaints"
            });
        }

        // Photo upload will be added later
        const photoUrl = req.file
            ? `/uploads/${req.file.filename}`
            : null;

        // Create complaint
        const complaintResult = await pool.query(
            `INSERT INTO complaints
            (resident_id, category, description, photo_url)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                req.user.id,
                category,
                description,
                photoUrl
            ]
        );

        const complaint = complaintResult.rows[0];

        // Create initial status history
        await pool.query(
            `INSERT INTO complaint_status_history
            (complaint_id, old_status, new_status, changed_by, note)
            VALUES ($1, $2, $3, $4, $5)`,
            [
                complaint.id,
                null,
                "Open",
                req.user.id,
                "Complaint created"
            ]
        );

        res.status(201).json({
            message: "Complaint created successfully",
            complaint
        });

    } catch (error) {
        console.error("Create complaint error:", error);

        res.status(500).json({
            message: "Server error while creating complaint"
        });
    }
};


const getMyComplaints = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT *
             FROM complaints
             WHERE resident_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            complaints: result.rows
        });

    } catch (error) {
        console.error("Get complaints error:", error);

        res.status(500).json({
            message: "Server error while fetching complaints"
        });
    }
};
const getComplaintHistory = async (req, res) => {
    try {
        const complaintId = req.params.id;

        // Make sure the complaint belongs to the logged-in resident
        const complaintResult = await pool.query(
            `SELECT *
             FROM complaints
             WHERE id = $1 AND resident_id = $2`,
            [complaintId, req.user.id]
        );

        if (complaintResult.rows.length === 0) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        const historyResult = await pool.query(
            `SELECT
                csh.id,
                csh.old_status,
                csh.new_status,
                csh.note,
                csh.changed_at,
                u.name AS changed_by_name
             FROM complaint_status_history csh
             JOIN users u
                ON csh.changed_by = u.id
             WHERE csh.complaint_id = $1
             ORDER BY csh.changed_at ASC`,
            [complaintId]
        );

        res.json({
            complaint: complaintResult.rows[0],
            history: historyResult.rows
        });

    } catch (error) {
        console.error("Get complaint history error:", error);

        res.status(500).json({
            message: "Server error while fetching complaint history"
        });
    }
};


module.exports = {
    createComplaint,
    getMyComplaints,
    getComplaintHistory
};