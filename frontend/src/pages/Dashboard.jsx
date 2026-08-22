import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [complaintsResponse, noticesResponse] =
                    await Promise.all([
                        api.get("/complaints/me"),
                        api.get("/notices")
                    ]);

                setComplaints(
                    complaintsResponse.data.complaints
                );

                setNotices(
                    noticesResponse.data.notices
                );

            } catch (error) {
                console.error(
                    "Dashboard loading error:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (loading) {
        return <h2>Loading dashboard...</h2>;
    }

    return (
        <div>
            <h1>Welcome, {user?.name}</h1>

            <p>
                Flat Number: {user?.flat_number}
            </p>

            <button onClick={handleLogout}>
                Logout
            </button>
            <button
                onClick={() => navigate("/complaints/new")}
            >
                + New Complaint
            </button>

            <hr />

            <h2>My Complaints</h2>

            {complaints.length === 0 ? (
                <p>No complaints found.</p>
            ) : (
                complaints.map((complaint) => (
                    <div key={complaint.id}>
                        <h3>
                            Complaint #{complaint.id}
                        </h3>

                        <p>
                            Category: {complaint.category}
                        </p>

                        <p>
                            Description: {complaint.description}
                        </p>

                        <p>
                            Priority: {complaint.priority}
                        </p>

                        <p>
    Status: {complaint.status}
</p>

{complaint.photo_url && (
    <div>
        <p>Attached Photo:</p>

        <img
            src={`http://localhost:5000${complaint.photo_url}`}
            alt={`Complaint ${complaint.id}`}
            style={{
                width: "250px",
                maxHeight: "200px",
                objectFit: "cover",
                borderRadius: "8px"
            }}
        />
    </div>
)}

<button
    onClick={() =>
        navigate(`/complaints/${complaint.id}`)
    }
>
    View Details
</button>

<hr />
                    </div>
                ))
            )}

            <h2>Society Notices</h2>

            {notices.length === 0 ? (
                <p>No notices available.</p>
            ) : (
                notices.map((notice) => (
                    <div key={notice.id}>
                        <h3>{notice.title}</h3>

                        <p>{notice.body}</p>

                        {notice.is_important && (
                            <strong>
                                Important Notice
                            </strong>
                        )}

                        <p>
                            Posted by:{" "}
                            {notice.posted_by_name}
                        </p>

                        <hr />
                    </div>
                ))
            )}
        </div>
    );
};

export default Dashboard;