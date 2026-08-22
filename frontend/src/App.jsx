import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateComplaint from "./pages/CreateComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>

                <Routes>

                    <Route
                        path="/"
                        element={<Login />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />
                    <Route
                        path="/complaints/new"
                        element={<CreateComplaint />}
                    />
                    <Route
                        path="/complaints/:id"
                        element={<ComplaintDetails />}
                    />
                    <Route
                        path="/admin"
                        element={<AdminDashboard />}
                    />
                </Routes>

            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;