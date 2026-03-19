import { React, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

export default function SectionEnrollment() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState(["A", "B", "C", "D"]);

  useEffect(() => {
    fetch("http://localhost/sms/backend/admin/getDepartment.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setDepartments(data.department))
      .catch((err) => console.error(err));
  }, []);

  const [formData, setFormData] = useState({
    year: "",
    semester: "",
    department_id: "",
    section: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      setFormData((prev) => ({
        ...prev,
        department_id: user.department_id,
      }));
    }
  }, [user]);

  const handleEnrollment = async (e) => {
    e.preventDefault();
    const { year, semester, department_id, section } = formData;

    if (!year || !semester || !department_id || !section) {
      return toast.error("Please fill all fields");
    }

    try {
      const res = await fetch(
        "http://localhost/sms/backend/admin/section_enrollment.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ year, semester, department_id, section }),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "Enrollment failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-200">
      <div className="bg-white p-6 rounded-2xl mt-10 max-w-4xl">
        <h1 className="text-2xl font-bold text-blue-950">Section Enrollment</h1>
        <ToastContainer autoClose={1000} />
        <p className="text-gray-600 mt-2">Enroll students into a specific section.</p>

        <form className="space-y-6" onSubmit={handleEnrollment}>
          <div className="grid grid-cols-1 w-96 h-96">
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

            {user?.role === "admin" ? (
              <input type="hidden" name="department_id" value={formData.department_id} />
            ) : (
              <select
                className="input-style"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}

            <select
              className="input-style"
              name="section"
              value={formData.section}
              onChange={handleChange}
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="bg-blue-950 hover:bg-blue-800 text-white font-bold rounded-xl"
            >
              Enroll Section
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}