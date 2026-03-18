import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

export default function UpdateStudent() {
  const { user } = useAuth(); 
  const [departments, setDepartments] = useState([]);
  const [teacherIdSearch, setTeacherIdSearch] = useState(""); 

  const [formData, setFormData] = useState({
    teacherId: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    role: "teacher",
    experience: "",
    department_id: "",
    gender: "",
    education_level: "",
    specialization: "",
    phone_number: "",
    office_number: ""
  });

  // Auto-fill department_id if user is admin
  useEffect(() => {
    if (user && user.role === "admin") {
      setFormData(prev => ({ ...prev, department_id: user.department_id }));
    }
  }, [user]);

  // Fetch department(s)
  useEffect(() => {
    fetch("http://localhost/sms/backend/admin/getDepartment.php", { credentials: "include" })
      .then(res => res.json())
      .then(data => setDepartments(data.department ? [data.department] : []))
      .catch(err => console.error(err));
  }, []);

  // Fetch student by ID
  const fetchStudentById = async () => {
    if (!teacherIdSearch.trim()) return toast.error("Please enter a Student ID");

    try {
      const res = await fetch(`http://localhost/sms/backend/admin/teacher.php?teacherId=${encodeURIComponent(teacherIdSearch)}`, {
        credentials: "include"
      });
      const data = await res.json();

      if (data && data.teacher) {
        if(user.department_id !=data.teacher.department_id){
            toast.error("You don't have permission to edit this student");
            return;
        }
        setFormData({
          teacherId: data.teacher.teacher_id,
          first_name: data.teacher.first_name,
          middle_name: data.teacher.middle_name,
          last_name: data.teacher.last_name,
          email: data.teacher.email,
          gender: data.teacher.gender,
          experience: data.teacher.experience,
          education_level: data.teacher.education_level, // match your DB column
          department_id: data.teacher.department_id,
          specialization: data.teacher.specialization,
          phone_number: data.teacher.phone_number,
          office_number: data.teacher.office_number,
          role: "teacher"
        });
      } else {
        toast.error("teacher not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching teacher");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const requiredFields = ["first_name", "middle_name", "last_name", "teacherId", "email", "gender", "department_id", "education_level", "experience", "specialization", "phone_number", "office_number"];
    for (const field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        toast.error(`Please fill in ${field.replace(/_/g, " ")}`);
        return false;
      }
    }
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch("http://localhost/sms/backend/admin/teacher.php?teacherId=" + encodeURIComponent(formData.teacherId), {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during update");
    }
  };

  return (
    <div className='flex flex-col items-center justify-center bg-gray-200 min-h-screen p-4'>
      <ToastContainer autoClose={1000} />

      {/* SEARCH BY STUDENT ID */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter Teacher ID"
          value={teacherIdSearch}
          onChange={(e) => setTeacherIdSearch(e.target.value)}
          className="px-4 py-2 border border-blue-400 rounded bg-white text-black w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchStudentById}
          className="bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Search
        </button>
      </div>

      {/* UPDATE FORM */}
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl p-8">
        <h2 className="text-3xl font-bold text-blue-950 mb-6 text-center">
          Update Teacher
        </h2>

        <form className="space-y-6" onSubmit={handleUpdate}>
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="input-style" name="first_name" value={formData.first_name} onChange={handleChange} />
              <input type="text" placeholder="Middle Name" className="input-style" name="middle_name" value={formData.middle_name} onChange={handleChange} />
              <input type="text" placeholder="Last Name" className="input-style" name="last_name" value={formData.last_name} onChange={handleChange} />
              <input type="text" placeholder="Student ID" className="input-style" name="teacherId" value={formData.teacherId} onChange={handleChange} readOnly />
              <input type="email" placeholder="Email Address" className="input-style" name="email" value={formData.email} onChange={handleChange} />
              <input name="phone" value={formData.phone_number} onChange={handleChange} type="tel" placeholder="Phone Number" className="input-style"
              />
              <select className="input-style" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Department */}
              {user?.role === "admin" ? (
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 ml-1">Department</label>
                  <input type="text" className="input-style bg-gray-100 cursor-not-allowed" value={departments[0]?.name || "Loading..."} readOnly />
                  <input type="hidden" name="department_id" value={formData.department_id} />
                </div>
              ) : (
                <select className="input-style" name="department_id" value={formData.department_id} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              )}
             <input name="specialization" value={formData.specialization} onChange={handleChange}type="text"placeholder="Specialization (e.g. AI, Networking)"className="input-style"
              />
              <select className="input-style" name="education_level" value={formData.education_level} onChange={handleChange}>
                <option value="">Qualification</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>

              <input
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                type="number"
                placeholder="Years of Experience"
                className="input-style"
              />
              <input
                name="office_number"
                value={formData.office_number}
                onChange={handleChange}
                type="text"
                placeholder="Office Number"
                className="input-style"
              />

              <input className="input-style" type="text" name="role" value="teacher" readOnly />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="w-full bg-blue-950 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition duration-300 transform hover:scale-105">
            Update Teacher
          </button>
        </form>
      </div>
    </div>
  );
}