const pool = require("../models/db");
const {
    sendImportantNoticeEmail
} = require("../utils/email");
const createNotice = async (req, res) => {
    try {
        const { title, body, is_important } = req.body;

        if (!title || !body) {
            return res.status(400).json({
                message: "Title and body are required"
            });
        }

        const important = is_important === true;

        const result = await pool.query(
            `INSERT INTO notices
                (posted_by, title, body, is_important)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                req.user.id,
                title,
                body,
                important
            ]
        );
        if (important) {
    const residents = await pool.query(
        `SELECT name, email
         FROM users
         WHERE role = 'resident'`
    );

    for (const resident of residents.rows) {
        try {
            await sendImportantNoticeEmail(
                resident.email,
                resident.name,
                result.rows[0].title,
                result.rows[0].body
            );
        } catch (emailError) {
            console.error(
                `Failed to send email to ${resident.email}:`,
                emailError.message
            );
        }
    }
}

        res.status(201).json({
            message: "Notice created successfully",
            notice: result.rows[0]
        });

    } catch (error) {
        console.error("Create notice error:", error);

        res.status(500).json({
            message: "Server error while creating notice"
        });
    }
};


const getNotices = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                n.id,
                n.title,
                n.body,
                n.is_important,
                n.created_at,
                u.name AS posted_by_name
             FROM notices n
             JOIN users u
                ON n.posted_by = u.id
             ORDER BY n.is_important DESC, n.created_at DESC`
        );

        res.json({
            notices: result.rows
        });

    } catch (error) {
        console.error("Get notices error:", error);

        res.status(500).json({
            message: "Server error while fetching notices"
        });
    }
};


module.exports = {
    createNotice,
    getNotices
};