import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [complaints, setComplaints] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updatingId, setUpdatingId] = useState(null);
    const [updateMessage, setUpdateMessage] = useState("");

    const [statusValues, setStatusValues] = useState({});
    const [priorityValues, setPriorityValues] = useState({});
    const [notes, setNotes] = useState({});

    const [statusFilter, setStatusFilter] = useState("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [noticeTitle, setNoticeTitle] = useState("");
    const [noticeBody, setNoticeBody] = useState("");
    const [noticeImportant, setNoticeImportant] = useState(false);
    const [noticeMessage, setNoticeMessage] = useState("");
    const [noticeError, setNoticeError] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const fetchAdminDashboard = async () => {
        try {
            setError("");

            const [statsResponse, complaintsResponse] =
                await Promise.all([
                    api.get("/admin/dashboard/stats"),
                    api.get("/admin/complaints")
                ]);

            setStats(statsResponse.data);
            setComplaints(
                complaintsResponse.data.complaints
            );

        } catch (err) {
            console.error(
                "Admin dashboard error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load admin dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminDashboard();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleStatusChange = (complaintId, status) => {
        setStatusValues((previous) => ({
            ...previous,
            [complaintId]: status
        }));
    };
    const handlePriorityChange = (complaintId, priority) => {
    setPriorityValues((previous) => ({
        ...previous,
        [complaintId]: priority
    }));
};
    const handleNoteChange = (complaintId, note) => {
        setNotes((previous) => ({
            ...previous,
            [complaintId]: note
        }));
    };
    const handleCreateNotice = async (e) => {
    e.preventDefault();

    try {
        setNoticeMessage("");
        setNoticeError("");

        const response = await api.post("/notices", {
            title: noticeTitle,
            body: noticeBody,
            is_important: noticeImportant
        });

        setNoticeMessage(
            response.data.message ||
            "Notice created successfully"
        );

        setNoticeTitle("");
        setNoticeBody("");
        setNoticeImportant(false);

    } catch (err) {
        console.error("Create notice error:", err);

        setNoticeError(
            err.response?.data?.message ||
            "Failed to create notice"
        );
    }
};

    const handleUpdateComplaint = async (complaintId) => {
        try {
            setUpdatingId(complaintId);
            setUpdateMessage("");
            setError("");

            const complaint = complaints.find(
                (item) => item.id === complaintId
            );

            const newStatus =
            statusValues[complaintId] ||
            complaint.status;

            const newPriority =
            priorityValues[complaintId] ||
            complaint.priority;

            const note =
            notes[complaintId] || "";

            const response = await api.patch(
                `/admin/complaints/${complaintId}`,
                {
                    status: newStatus,
                    priority: newPriority,
                    note: note
                }
            );

            setUpdateMessage(
                response.data.message ||
                "Complaint updated successfully"
            );

            await fetchAdminDashboard();

            setNotes((previous) => ({
                ...previous,
                [complaintId]: ""
            }));

        } catch (err) {
            console.error(
                "Update complaint error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update complaint"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <h2>Loading admin dashboard...</h2>;
    }

    if (error && !stats) {
        return <p>{error}</p>;
    }
    const filteredComplaints = complaints.filter((complaint) => {
    const statusMatch =
        statusFilter === "All" ||
        complaint.status === statusFilter;

    const categoryMatch =
        categoryFilter === "All" ||
        complaint.category === categoryFilter;

    const priorityMatch =
        priorityFilter === "All" ||
        complaint.priority === priorityFilter;

    const dateMatch =
        !dateFilter ||
    complaint.created_at.slice(0, 10) === dateFilter;

    return (
        statusMatch &&
        categoryMatch &&
        priorityMatch &&
        dateMatch
        );
    });
    return (
        <div>
            <h1>
                Welcome, {user?.name}
            </h1>

            <p>
                Society Administration Dashboard
            </p>

            <button onClick={handleLogout}>
                Logout
            </button>

            <hr />

            {updateMessage && (
                <p>
                    {updateMessage}
                </p>
            )}

            {error && (
                <p>
                    {error}
                </p>
            )}

            <h2>Complaint Statistics</h2>

            {stats && (
                <div>
                    <p>
                        <strong>Total:</strong>{" "}
                        {stats.complaints.total}
                    </p>

                    <p>
                        <strong>Open:</strong>{" "}
                        {stats.complaints.open}
                    </p>

                    <p>
                        <strong>In Progress:</strong>{" "}
                        {stats.complaints.in_progress}
                    </p>

                    <p>
                        <strong>Resolved:</strong>{" "}
                        {stats.complaints.resolved}
                    </p>

                    <p>
                        <strong>High Priority:</strong>{" "}
                        {stats.complaints.high_priority}
                    </p>

                    <p>
                        <strong>Overdue:</strong>{" "}
                        {stats.complaints.overdue}
                    </p>

                    <p>
                        <strong>Total Notices:</strong>{" "}
                        {stats.notices.total}
                    </p>
                    <h3>Complaints by Category</h3>

{stats.by_category && stats.by_category.length > 0 ? (
    <ul style={{ listStyle: "none", padding: 0 }}>
        {stats.by_category.map((item) => (
            <li key={item.category}>
                <strong>{item.category}:</strong>{" "}
                {item.total}
            </li>
        ))}
    </ul>
) : (
    <p>No category data available.</p>
)}
                </div>
            )}

            <hr />
            <hr />

<h2>Create Society Notice</h2>

<form onSubmit={handleCreateNotice}>

    <div>
        <label>
            Title:
        </label>

        <br />

        <input
            type="text"
            value={noticeTitle}
            onChange={(e) =>
                setNoticeTitle(e.target.value)
            }
            placeholder="Notice title"
            required
        />
    </div>

    <div>
        <label>
            Message:
        </label>

        <br />

        <textarea
            value={noticeBody}
            onChange={(e) =>
                setNoticeBody(e.target.value)
            }
            placeholder="Write your notice..."
            rows="5"
            required
        />
    </div>

    <div>
        <label>
            <input
                type="checkbox"
                checked={noticeImportant}
                onChange={(e) =>
                    setNoticeImportant(
                        e.target.checked
                    )
                }
            />

            Important Notice
        </label>
    </div>

    <button type="submit">
        Publish Notice
    </button>

</form>

{noticeMessage && (
    <p>
        {noticeMessage}
    </p>
)}

{noticeError && (
    <p>
        {noticeError}
    </p>
)}

            <h2>All Complaints</h2>
            <div>
    <label>
        Status:
    </label>

    <select
        value={statusFilter}
        onChange={(e) =>
            setStatusFilter(e.target.value)
        }
    >
        <option value="All">
            All
        </option>

        <option value="Open">
            Open
        </option>

        <option value="In Progress">
            In Progress
        </option>

        <option value="Resolved">
            Resolved
        </option>
    </select>

    <label>
        Category:
    </label>

    <select
        value={categoryFilter}
        onChange={(e) =>
            setCategoryFilter(e.target.value)
        }
    >
        <option value="All">
            All
        </option>

        <option value="Plumbing">
            Plumbing
        </option>

        <option value="Electrical">
            Electrical
        </option>

        <option value="Maintenance">
            Maintenance
        </option>

        <option value="Security">
            Security
        </option>

        <option value="Cleaning">
            Cleaning
        </option>

        <option value="Other">
            Other
        </option>
    </select>

    <label>
        Priority:
    </label>

    <select
        value={priorityFilter}
        onChange={(e) =>
            setPriorityFilter(e.target.value)
        }
    >
        <option value="All">
            All
        </option>

        <option value="Low">
            Low
        </option>

        <option value="Medium">
            Medium
        </option>

        <option value="High">
            High
        </option>
    </select>

    <label>
    Date:
</label>

<input
    type="date"
    value={dateFilter}
    onChange={(e) =>
        setDateFilter(e.target.value)
    }
/>

<button
    type="button"
    onClick={() => setDateFilter("")}
>
    Clear Date
</button>
</div>

            {filteredComplaints.length === 0 ? (
                <p>No complaints found.</p>
            ) : (
                filteredComplaints.map((complaint) => (
                    <div key={complaint.id}>

                        <h3>
                            Complaint #{complaint.id}
                        </h3>

                        <p>
                            Resident:{" "}
                            {complaint.resident_name}
                        </p>

                        <p>
                            Flat:{" "}
                            {complaint.flat_number}
                        </p>

                        <p>
                            Category:{" "}
                            {complaint.category}
                        </p>

                        <p>
                            Description:{" "}
                            {complaint.description}
                        </p>

                        <p>
                            Priority:{" "}
                            {complaint.priority}
                        </p>
                        <div>
    <label>
        Update Priority:
    </label>

    <select
        value={
            priorityValues[complaint.id] ||
            complaint.priority
        }
        onChange={(e) =>
            handlePriorityChange(
                complaint.id,
                e.target.value
            )
        }
    >
        <option value="Low">
            Low
        </option>

        <option value="Medium">
            Medium
        </option>

        <option value="High">
            High
        </option>
    </select>
</div>
                        <p>
                            Current Status:{" "}
                            {complaint.status}
                        </p>

                        {complaint.photo_url && (
                            <div>
                                <p>Photo:</p>

                                <img
                                    src={`http://localhost:5000${complaint.photo_url}`}
                                    alt={`Complaint ${complaint.id}`}
                                    style={{
                                        width: "200px",
                                        maxHeight: "150px",
                                        objectFit: "cover",
                                        borderRadius: "8px"
                                    }}
                                />
                            </div>
                        )}

                        <div>
                            <label>
                                Update Status:
                            </label>

                            <select
                                value={
                                    statusValues[
                                        complaint.id
                                    ] ||
                                    complaint.status
                                }
                                onChange={(e) =>
                                    handleStatusChange(
                                        complaint.id,
                                        e.target.value
                                    )
                                }
                            >
                                <option value="Open">
                                    Open
                                </option>

                                <option value="In Progress">
                                    In Progress
                                </option>

                                <option value="Resolved">
                                    Resolved
                                </option>
                            </select>
                        </div>

                        <div>
                            <label>
                                Note:
                            </label>

                            <br />

                            <textarea
                                value={
                                    notes[
                                        complaint.id
                                    ] || ""
                                }
                                onChange={(e) =>
                                    handleNoteChange(
                                        complaint.id,
                                        e.target.value
                                    )
                                }
                                placeholder="Add a note about this update..."
                                rows="3"
                            />
                        </div>

                        <button
                            onClick={() =>
                                handleUpdateComplaint(
                                    complaint.id
                                )
                            }
                            disabled={
                                updatingId ===
                                complaint.id
                            }
                        >
                            {updatingId === complaint.id
                                ? "Updating..."
                                : "Update Complaint"}
                        </button>

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminDashboard;