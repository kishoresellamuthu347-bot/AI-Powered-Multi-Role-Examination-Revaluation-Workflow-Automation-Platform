import React, { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import EvaluatorDashboard from "./pages/EvaluatorDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { Toast } from "./components/ui";
import { clearToken, isLoggedIn } from "./api";

export default function App() {
  const [role, setRole] = useState(localStorage.getItem("revalai_role"));
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  function notify(tone, msg) {
    setToast({ tone, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function logout() {
    clearToken();
    localStorage.removeItem("revalai_role");
    localStorage.removeItem("revalai_name");
    setRole(null);
    navigate("/login");
  }

  function Guard({ allow, children }) {
    if (!isLoggedIn() || role !== allow) return <Navigate to="/login" replace />;
    return children;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login onLoggedIn={(r) => setRole(r)} />} />
        <Route path="/student" element={<Guard allow="student"><StudentDashboard onLogout={logout} notify={notify} /></Guard>} />
        <Route path="/evaluator" element={<Guard allow="evaluator"><EvaluatorDashboard onLogout={logout} notify={notify} /></Guard>} />
        <Route path="/officer" element={<Guard allow="officer"><OfficerDashboard onLogout={logout} notify={notify} /></Guard>} />
        <Route path="/admin" element={<Guard allow="admin"><AdminDashboard onLogout={logout} notify={notify} /></Guard>} />
        <Route path="*" element={<Navigate to={isLoggedIn() && role ? `/${role}` : "/login"} replace />} />
      </Routes>
      <Toast toast={toast} />
    </>
  );
}
