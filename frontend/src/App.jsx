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
import UpdateStudent from "./pages/admin/UpdateStudent";
import Teachers from "./pages/admin/Teachers";
import UpdateTeacher from "./pages/admin/UpdateTeacher";
import Course from './pages/admin/Course';
import StudentEnrollment from './pages/admin/StudentEnrollment';
import CurriculumForm from './pages/admin/CurriculumForm';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="student-registration" element={<StudentRegistration />} />
          <Route path="teacher-registration" element={<TeacherRegistration />} />
          <Route path="update-student" element={<UpdateStudent />} />
          <Route path='update-teacher'  element={<UpdateTeacher />}/>
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="courses" element={<Course />} />
          <Route path="student-enrollment" element={<StudentEnrollment />} />
          <Route path="curriculum-form" element={<CurriculumForm />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;