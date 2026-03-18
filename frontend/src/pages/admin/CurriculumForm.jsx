import Select from "react-select";
import { useState } from "react";

export default function CurriculumForm({ courses }) {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
    
  const options = courses.map(c => ({ value: c.id, label: c.course_name }));

  const handleSubmit = async () => {
    if (!year || !semester || selectedCourses.length === 0) return alert("Fill all fields");

    const courseIds = selectedCourses.map(c => c.value);

    await fetch("/backend/curriculum.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, semester, courses: courseIds }),
    });

    alert("Curriculum saved!");
  };

  return (
    <div>
      <select onChange={e => setYear(e.target.value)}>
        <option value="">Select Year</option>
        <option value="1">Year 1</option>
        <option value="2">Year 2</option>
      </select>

      <select onChange={e => setSemester(e.target.value)}>
        <option value="">Select Semester</option>
        <option value="1">Semester 1</option>
        <option value="2">Semester 2</option>
      </select>

      <Select
        isMulti
        options={options}
        onChange={setSelectedCourses}
        placeholder="Select courses..."
      />

      <button onClick={handleSubmit}>Save Curriculum</button>
    </div>
  );
}