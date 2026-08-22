import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ComplaintDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchComplaintHistory = async () => {
            try {
                const response = await api.get(
                    `/complaints/${id}/history`
                );

                setComplaint(response.data.complaint);
                setHistory(response.data.history);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load complaint"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchComplaintHistory();
    }, [id]);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!complaint) {
        return <p>Complaint not found.</p>;
    }

    return (
        <div>
            <h1>
                Complaint #{complaint.id}
            </h1>

            <p>
                <strong>Category:</strong>{" "}
                {complaint.category}
            </p>

            <p>
                <strong>Description:</strong>{" "}
                {complaint.description}
            </p>

            <p>
                <strong>Priority:</strong>{" "}
                {complaint.priority}
            </p>

            <p>
                <strong>Status:</strong>{" "}
                {complaint.status}
            </p>

            <p>
                <strong>Created:</strong>{" "}
                {new Date(
                    complaint.created_at
                ).toLocaleString()}
            </p>

            {complaint.resolved_at && (
                <p>
                    <strong>Resolved:</strong>{" "}
                    {new Date(
                        complaint.resolved_at
                    ).toLocaleString()}
                </p>
            )}

            {complaint.photo_url && (
                <div>
                    <h3>Attached Photo</h3>

                    <img
                        src={`http://localhost:5000${complaint.photo_url}`}
                        alt={`Complaint ${complaint.id}`}
                        style={{
                            width: "300px",
                            maxHeight: "300px",
                            objectFit: "cover",
                            borderRadius: "8px"
                        }}
                    />
                </div>
            )}

            <h2>Status History</h2>

            {history.length === 0 ? (
                <p>No history available.</p>
            ) : (
                history.map((item) => (
                    <div key={item.id}>
                        <h3>
                            {item.new_status}
                        </h3>

                        {item.old_status && (
                            <p>
                                {item.old_status}
                                {" → "}
                                {item.new_status}
                            </p>
                        )}

                        <p>
                            {item.note}
                        </p>

                        <p>
                            {new Date(
                                item.changed_at
                            ).toLocaleString()}
                        </p>

                        {item.changed_by_name && (
                            <p>
                                Changed by:{" "}
                                {item.changed_by_name}
                            </p>
                        )}

                        <hr />
                    </div>
                ))
            )}

            <button
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default ComplaintDetails;