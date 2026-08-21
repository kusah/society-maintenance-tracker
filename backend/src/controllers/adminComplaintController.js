const pool = require("../models/db");

const getAllComplaints = async (req, res) => {
    try {
        const { category, status, date } = req.query;

        let query = `
            SELECT
                c.id,
                c.resident_id,
                u.name AS resident_name,
                u.email AS resident_email,
                u.flat_number,
                c.category,
                c.description,
                c.photo_url,
                c.priority,
                c.status,
                c.created_at,
                c.resolved_at
            FROM complaints c
            JOIN users u
                ON c.resident_id = u.id
        `;

        const conditions = [];
        const values = [];

        if (category) {
            values.push(category);
            conditions.push(`c.category = $${values.length}`);
        }

        if (status) {
            values.push(status);
            conditions.push(`c.status = $${values.length}`);
        }

        if (date) {
            values.push(date);
            conditions.push(`DATE(c.created_at) = $${values.length}`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY c.created_at DESC";

        const result = await pool.query(query, values);

        res.json({
            complaints: result.rows
        });

    } catch (error) {
        console.error("Get all complaints error:", error);

        res.status(500).json({
            message: "Server error while fetching complaints"
        });
    }
};
const updateComplaint = async (req, res) => {
    try {
        const complaintId = req.params.id;
        const { priority, status, note } = req.body;

        const allowedPriorities = ["Low", "Medium", "High"];
        const allowedStatuses = ["Open", "In Progress", "Resolved"];

        // Validate priority if provided
        if (priority && !allowedPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority"
            });
        }

        // Validate status if provided
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        if (!priority && !status) {
            return res.status(400).json({
                message: "Provide priority or status to update"
            });
        }

        // Get existing complaint
        const existingResult = await pool.query(
            `SELECT *
             FROM complaints
             WHERE id = $1`,
            [complaintId]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        const existingComplaint = existingResult.rows[0];

        const newPriority = priority || existingComplaint.priority;
        const newStatus = status || existingComplaint.status;

        let resolvedAt = existingComplaint.resolved_at;

        // Set resolved timestamp when resolved
        if (newStatus === "Resolved") {
            resolvedAt = new Date();
        } else {
            resolvedAt = null;
        }

        // Update complaint
        const updateResult = await pool.query(
            `UPDATE complaints
             SET priority = $1,
                 status = $2,
                 resolved_at = $3
             WHERE id = $4
             RETURNING *`,
            [
                newPriority,
                newStatus,
                resolvedAt,
                complaintId
            ]
        );

        const updatedComplaint = updateResult.rows[0];

        // Record status change in history
        if (newStatus !== existingComplaint.status) {
            await pool.query(
                `INSERT INTO complaint_status_history
                (complaint_id, old_status, new_status, changed_by, note)
                VALUES ($1, $2, $3, $4, $5)`,
                [
                    complaintId,
                    existingComplaint.status,
                    newStatus,
                    req.user.id,
                    note || null
                ]
            );
        }

        res.json({
            message: "Complaint updated successfully",
            complaint: updatedComplaint
        });

    } catch (error) {
        console.error("Update complaint error:", error);

        res.status(500).json({
            message: "Server error while updating complaint"
        });
    }
};

const getOverdueComplaints = async (req, res) => {
    try {
        const overdueHours = Number(process.env.COMPLAINT_OVERDUE_HOURS || 48);

        const result = await pool.query(
            `SELECT
                c.id,
                c.resident_id,
                u.name AS resident_name,
                u.email AS resident_email,
                u.flat_number,
                c.category,
                c.description,
                c.photo_url,
                c.priority,
                c.status,
                c.created_at,
                c.resolved_at,
                NOW() - c.created_at AS age
             FROM complaints c
             JOIN users u
                ON c.resident_id = u.id
             WHERE c.status != 'Resolved'
               AND c.created_at < NOW() - ($1 * INTERVAL '1 hour')
             ORDER BY c.created_at ASC`,
            [overdueHours]
        );

        res.json({
            overdue_hours: overdueHours,
            complaints: result.rows
        });

    } catch (error) {
        console.error("Get overdue complaints error:", error);

        res.status(500).json({
            message: "Server error while fetching overdue complaints"
        });
    }
};

module.exports = {
    getAllComplaints,
    updateComplaint,
    getOverdueComplaints
};