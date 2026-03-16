import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentRegistration from "./pages/admin/StudentRegistration";
import TeacherRegistration from "./pages/admin/TeacherRegistration";
import Students from "./pages/admin/Students";
import AdminLayout from "./Layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { checkAuth } from "./utils/auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await checkAuth();
      setUser(userData);
      setLoading(false);
    };
    loadUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={
          <ProtectedRoute user={user} allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="student-registration" element={<StudentRegistration />} />
          <Route path="teacher-registration" element={<TeacherRegistration />} />
          <Route path="students" element={<Students />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;