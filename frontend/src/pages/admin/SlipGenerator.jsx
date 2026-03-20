import { useState, useEffect } from 'react';

export default function SlipGenerator() {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost/sms/backend/admin/slipGenerator.php', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // Data is directly the array of student-course rows (no wrapper)
        const grouped = groupByStudent(data);
        setStudentsData(grouped);
      } catch (err) {
        console.error(err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupByStudent = (rows) => {
    const map = new Map();
    rows.forEach(row => {
      const id = row.student_id;
      if (!map.has(id)) {
        map.set(id, {
          student_id: id,
          full_name: row.full_name,
          year: row.year,
          semester: row.semister,        // note: field is 'semister' (typo) in backend
          courses: []
        });
      }
      map.get(id).courses.push({
        course_name: row.course_name,
        course_code: row.course_code,
        credit_hour: row.credit_hour,
        category: row.category
      });
    });
    return Array.from(map.values());
  };

  if (loading) return <div className="p-6 text-center">Loading slips...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-200 space-y-8">
      {studentsData.map(student => (
        <div key={student.student_id} className="bg-gray-50 p-3 rounded shadow">
          {/* Student header info */}
          <div className="grid grid-cols-4 items-center gap-25 mt-5">
            <p><strong>Student name:</strong> {student.full_name}</p>
            <p><strong>Id:</strong> {student.student_id}</p>
            <p><strong>Year:</strong> {student.year}</p>
            <p><strong>Semester:</strong> {student.semester}</p>
          </div>

          {/* Application text */}
          <div className="flex items-center gap-25 mt-5">
            <p>I am applying to be registered for the following courses</p>
            <p>Signature: -----------------</p>
          </div>

          {/* Courses table */}
          <div className="mt-3">
            <div className="max-h-55 overflow-y-auto">
              <table className="w-full border border-gray-400 border-collapse">
                <thead className="text-black">
                  <tr>
                    <th className="border border-gray-400">Course Name</th>
                    <th className="border border-gray-400">Code</th>
                    <th className="border border-gray-400">Credit</th>
                    <th className="border border-gray-400">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {student.courses.length > 0 ? (
                    student.courses.map((course, idx) => (
                      <tr key={idx} className="text-center">
                        <td className="p-2 border border-gray-400">{course.course_name}</td>
                        <td className="border border-gray-400">{course.course_code}</td>
                        <td className="border border-gray-400">{course.credit_hour}</td>
                        <td className="border border-gray-400">{course.category || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center border border-gray-400">
                        No courses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer info */}
          <div className="grid grid-cols-4 mt-3">
            <p>Advisor name: _________________</p>
            <p>Signature: _________________</p>
            <p>Registration date: _________________</p>
          </div>
        </div>
      ))}
    </div>
  );
}