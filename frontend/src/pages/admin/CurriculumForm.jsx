import Select from "react-select";
import { useState, useEffect } from "react";
import { toast,ToastContainer } from "react-toastify";
export default function CurriculumForm() {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [courses, setCourses] = useState([]);

  // 🔹 Fetch courses
  useEffect(() => {
    fetch("http://localhost/sms/backend/admin/course.php", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => toast.error("Failed to load courses"));
  }, []);

  const options = courses.map(c => ({
    value: c.id,
    label: c.course_name
  }));

  const handleSubmit = async () => {
    if (!year || !semester || selectedCourses.length === 0) {
      return toast.error("Please fill in all fields and select at least one course");
    }

    const courseIds = selectedCourses.map(c => c.value);

    const res = await fetch("http://localhost/sms/backend/admin/curriculum.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ year, semester, courses: courseIds }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success(data.message);
    } else {
      toast.error(data.message || "Failed to save curriculum");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
        <div className="grid grid-cols-1 items-center justify-center bg-white rounded-2xl py-2 px-5 w-128 h-100">
           <ToastContainer 
              autoClose={1000}
              />
            <p className="text-3xl text-blue-950 font-bold text-center capitalize">curriculum creation form</p>
            <select value={year} onChange={e => setYear(e.target.value)}>
              <option value="">Select Year</option>
              {[...Array(8).keys()].slice(1).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <select value={semester} onChange={e => setSemester(e.target.value)}>
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>

            <Select
              isMulti
              options={options}
              value={selectedCourses}
              onChange={setSelectedCourses}
              placeholder="Select courses..."
            />

            <button onClick={handleSubmit}
              className="bg-blue-950 hover:bg-blue-800 rounded-2xl
               text-white font-bold p-3 transition duration-300 transform hover:scale-105"
            >Save Curriculum</button>
        </div>
    </div>
  );
}