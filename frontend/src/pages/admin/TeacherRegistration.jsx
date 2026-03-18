import {React,useState,useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
export default function TeacherRegistration() {
    const { user } = useAuth(); // 1. Get the logged-in user info
    const [departments, setDepartments] = useState(null);
    const [formData, setFormData] = useState({
        teacherId: "",
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        department_id: "", // This will be set dynamically
        specialization: "",
        qualification: "",
        experience: "",
        officeNumber: "",
        role: "teacher"
    });

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
            "firstName", "middleName", "lastName", "teacherId",
            "email", "phone", "gender", "department_id", "specialization",
            "qualification", "experience", "officeNumber"
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
            const res = await fetch("http://localhost/sms/backend/admin/teacher.php", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Teacher registered successfully!");
                setFormData({
                    teacherId: "",
                    firstName: "",
                    middleName: "",
                    lastName: "",
                    email: "",
                    phone: "",      
                });
            } else {
                toast.error(data.error || "Registration failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred during registration");
        }
    };

    useEffect(() => {
        fetch("http://localhost/sms/backend/admin/getDepartment.php", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => setDepartments(data.department))
            .catch(err => console.error(err));
    }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl p-8">
        
        {/* Title */}
        <h2 className="text-3xl font-bold text-blue-950 mb-6 text-center">
          Teacher Registration
        </h2>

        <form className="space-y-6" onSubmit={handleRegistration}>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Personal Information
            </h3>
              <ToastContainer autoClose={1000} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                placeholder="First Name"
                className="input-style"
              />
              <input
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}                
                type="text"
                placeholder="middle Name"
                className="input-style"
              />
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                placeholder="last Name"
                className="input-style"
              />    

              <input
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                type="text"
                placeholder="Teacher ID"
                className="input-style"
              />

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="Email Address"
                className="input-style"
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                placeholder="Phone Number"
                className="input-style"
              />
              <select className="input-style" name="gender" value={formData.gender} onChange={handleChange}>
                <option>Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>

            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Professional Information
            </h3>

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

              <input
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                type="text"
                placeholder="Specialization (e.g. AI, Networking)"
                className="input-style"
              />

              <select className="input-style" name="qualification" value={formData.qualification} onChange={handleChange}>
                <option>Qualification</option>
                <option>Bachelor's Degree</option>
                <option>Master's Degree</option>
                <option>PhD</option>
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
                name="officeNumber"
                value={formData.officeNumber}
                onChange={handleChange}
                type="text"
                placeholder="Office Number"
                className="input-style"
              />
              <input 
              className='input-style'
              type="text"
              name="role" 
              value="teacher"
              readOnly
               />
            </div>
          </div>

          {/* Submit Button */}
          <button onClick={handleRegistration}
            type="submit"
            className="w-full bg-blue-950 text-white py-3 rounded-lg font-semibold
            hover:bg-blue-800 transition duration-300 transform hover:scale-105"
          >
            Register Teacher
          </button>

        </form>
      </div>
    </div>
  );
}