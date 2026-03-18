import { useState, useEffect } from "react";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchStudents = async (query = "") => {
    try {
      const res = await fetch(
        `http://localhost/sms/backend/admin/teacher.php?search=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Optional: debounce input to avoid too many requests
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchStudents(search);
    }, 300); // wait 300ms after typing
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="w-full h-screen px-4 pt-8 bg-gray-200">
      <input
        type="text"
        placeholder="Search by Student ID or Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-4 py-2 border border-blue-400 rounded-full bg-white text-black w-64 h-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="overflow-x-auto border rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-950 text-white font-semibold text-sm">
            <tr>
              <th className="px-4 py-2 text-left">Teacher ID</th>
              <th className="px-4 py-2 text-left">First Name</th>
              <th className="px-4 py-2 text-left">Middle Name</th>
              <th className="px-4 py-2 text-left">Last Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Qualification</th>
              <th className="px-4 py-2 text-left">Gender</th>
              <th className="px-4 py-2 text-left">Experience</th>
              <th className="px-4 py-2 text-left">Phone Number</th>
              <th className="px-4 py-2 text-left">Office Number</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.teacher_id} className="hover:bg-gray-100 transition">
                <td className="px-4 py-2">{teacher.teacher_id}</td>
                <td className="px-4 py-2">{teacher.first_name}</td>
                <td className="px-4 py-2">{teacher.middle_name}</td>
                <td className="px-4 py-2">{teacher.last_name}</td>
                <td className="px-4 py-2">{teacher.email}</td>
                <td className="px-4 py-2">{teacher.name}</td>
                <td className="px-4 py-2">{teacher.education_level}</td>
                <td className="px-4 py-2">{teacher.gender}</td>
                <td className="px-4 py-2">{teacher.experience}</td>
                <td className="px-4 py-2">{teacher.phone_number}</td>
                <td className="px-4 py-2">{teacher.office_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}