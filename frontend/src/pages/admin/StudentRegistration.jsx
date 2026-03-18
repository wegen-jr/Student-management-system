import { React, useState, useEffect } from 'react';
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentRegistration() {
  const { user } = useAuth(); // 1. Get the logged-in user info
  const [departments, setDepartments] = useState(null);
  
  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    role: "student",
    year: "",
    department_id: "", // This will be set dynamically
    gender: "",
    semester: "",
  });

  // 2. Automatically sync department_id if the user is an admin
  useEffect(() => {
    if (user && user.role === "admin") {
      setFormData((prev) => ({
        ...prev,
        department_id: user.department_id,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName", "middleName", "lastName", "studentId",
      "email", "gender", "department_id", "year", "semester"
    ];

    for (const field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        toast.error(`Please fill in ${field.replace(/_/g, " ")}`);
        return false;
      }
    }
    return true;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch("http://localhost/sms/backend/admin/student.php", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        // Reset form but keep the department_id if they are an admin
        setFormData({
          ...formData,
          firstName: "",
          middleName: "",
          lastName: "",
          studentId: "",
          email: "",
          year: "",
          semester: "",
          gender: ""
        });
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (err) {
      toast.error("An error occurred during registration");
    }
  };

  useEffect(() => {
    // 3. Only fetch all departments if the user is a super_admin
    // Otherwise, you only need the name of the current admin's department
    fetch("http://localhost/sms/backend/admin/getDepartment.php",{
      credentials: "include"
    }
    )
      .then(res => res.json())
      .then(data => setDepartments(data.department))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className='flex flex-col items-center justify-center bg-gray-200 min-h-screen p-4'>
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl p-8">
        <h2 className="text-3xl font-bold text-blue-950 mb-6 text-center">
          Student Registration
        </h2>
        <ToastContainer autoClose={1000} />
        
        <form className="space-y-6" onSubmit={handleRegistration}>
          {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="input-style"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Middle Name"
              className="input-style"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="input-style"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <input
              type="text"
              placeholder="Student ID"
              className="input-style"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="input-style"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <select
              className="input-style"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 4. Conditional Department Field */}
              {user?.role === "admin" ? (
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 ml-1">Department</label>
                  <input
                    type="text"
                    className="input-style bg-gray-100 cursor-not-allowed"
                    value={departments?.name || "Loading..."}
                    readOnly
                  />
                  {/* Hidden input to ensure department_id is in the form if needed */}
                  <input type="hidden" name="department_id" value={formData.department_id} />
                </div>
              ) : (
                <select
                  className="input-style"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              )}

            <select
              className="input-style"
              name="year"
              value={formData.year}
              onChange={handleChange}
            >
              <option value="">Select Year</option>
              {[...Array(8).keys()].slice(1).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select
              className="input-style"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
            >
              <option value="">Select Semester</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
            <input 
              className='input-style'
              type="text"
              name="role" 
              value="student"
              readOnly
               />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleRegistration}
          className="w-full bg-blue-950 text-white py-3 rounded-lg font-semibold
            hover:bg-blue-800 transition duration-300 transform hover:scale-105"
        >
          Register Student
        </button>
      </form>
      </div>
    </div>
  );
}
