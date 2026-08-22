import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CreateComplaint = () => {
    const navigate = useNavigate();

    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("category", category);
            formData.append("description", description);

            if (photo) {
                formData.append("photo", photo);
            }

            const response = await api.post(
                "/complaints",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setMessage(response.data.message);

            setCategory("");
            setDescription("");
            setPhoto(null);

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create complaint"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Create Complaint</h1>

            {message && (
                <p>{message}</p>
            )}

            {error && (
                <p>{error}</p>
            )}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>
                        Category
                    </label>

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                        required
                    >
                        <option value="">
                            Select category
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
                </div>

                <div>
                    <label>
                        Description
                    </label>

                    <textarea
                        value={description}
                        onChange={(e) =>
                            setDescription(e.target.value)
                        }
                        placeholder="Describe the issue..."
                        required
                    />
                </div>

                <div>
                    <label>
                        Photo (optional)
                    </label>

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) =>
                            setPhoto(e.target.files[0])
                        }
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Submitting..."
                        : "Submit Complaint"}
                </button>

            </form>

            <button
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>
        </div>
    );
};

export default CreateComplaint;