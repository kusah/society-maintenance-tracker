const pool = require("../models/db");

const getDashboardStats = async (req, res) => {
    try {
        const overdueHours = Number(
            process.env.COMPLAINT_OVERDUE_HOURS || 48
        );

        const complaintsResult = await pool.query(`
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (
                    WHERE status = 'Open'
                )::int AS open,
                COUNT(*) FILTER (
                    WHERE status = 'In Progress'
                )::int AS in_progress,
                COUNT(*) FILTER (
                    WHERE status = 'Resolved'
                )::int AS resolved,
                COUNT(*) FILTER (
                    WHERE priority = 'High'
                )::int AS high_priority,
                COUNT(*) FILTER (
                    WHERE status != 'Resolved'
                    AND created_at < NOW() -
                        ($1 * INTERVAL '1 hour')
                )::int AS overdue
            FROM complaints
        `, [overdueHours]);
        const categoryResult = await pool.query(`
                SELECT
                category,
                COUNT(*)::int AS total
            FROM complaints
            GROUP BY category
            ORDER BY total DESC
`);

        const noticesResult = await pool.query(`
            SELECT COUNT(*)::int AS total
            FROM notices
        `);

        res.json({
    complaints: complaintsResult.rows[0],
    by_category: categoryResult.rows,
    notices: noticesResult.rows[0],
    overdue_hours: overdueHours
});
    } catch (error) {
        console.error("Dashboard stats error:", error);

        res.status(500).json({
            message: "Server error while fetching dashboard statistics"
        });
    }
};

module.exports = {
    getDashboardStats
};