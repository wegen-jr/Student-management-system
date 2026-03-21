import { useState, useEffect, useMemo } from 'react';
import { pdf } from '@react-pdf/renderer';
import { StudentSlipPDF } from './StudentSlipPDF';
import { BatchSlipsPDF } from './BatchSlipsPDF';


export default function SlipGenerator() {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState('');
  const [filters, setFilters] = useState({ year: '', semester: '' });
  const [downloadingBatch, setDownloadingBatch] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost/sms/backend/admin/slipGenerator.php', {
          credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

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
          semester: row.semister,
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

  // Filter students based on year and semester
  const filteredStudents = useMemo(() => {
    return studentsData.filter(student => {
      if (filters.year && student.year !== parseInt(filters.year)) return false;
      if (filters.semester && student.semester !== parseInt(filters.semester)) return false;
      return true;
    });
  }, [studentsData, filters]);

  // Extract unique years and semesters for dropdowns
  const years = useMemo(() => [...new Set(studentsData.map(s => s.year))].sort(), [studentsData]);
  const semesters = useMemo(() => [...new Set(studentsData.map(s => s.semester))].sort(), [studentsData]);

  const downloadSlip = async (student) => {
    setDownloading(student.student_id);
    try {
      const blob = await pdf(<StudentSlipPDF student={student} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slip_${student.student_id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
      // show error toast if you have a toast library
    } finally {
      setDownloading(null);
    }
  };

  const downloadBatch = async () => {
    if (filteredStudents.length === 0) {
      alert('No students match the selected filters');
      return;
    }
    setDownloadingBatch(true);
    try {
      const blob = await pdf(<BatchSlipsPDF students={filteredStudents} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `slips_${filters.year || 'all'}_${filters.semester || 'all'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Batch PDF generation failed:', error);
      alert('Failed to generate batch PDF');
    } finally {
      setDownloadingBatch(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading slips...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-200">
      {/* Filters and Batch Download */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <select
            name="year"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Years</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            name="semester"
            value={filters.semester}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
            className="px-3 py-2 border rounded"
          >
            <option value="">All Semesters</option>
            {semesters.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          onClick={downloadBatch}
          disabled={downloadingBatch}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {downloadingBatch ? 'Generating PDF...' : `Download Batch (${filteredStudents.length} students)`}
        </button>
      </div>

      {/* Individual Slips */}
      <div className="space-y-8">
        {filteredStudents.map(student => (
          <div key={student.student_id} className="bg-gray-50 p-3 rounded shadow">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => downloadSlip(student)}
                disabled={downloading === student.student_id}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {downloading === student.student_id ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
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
    </div>
  );
}