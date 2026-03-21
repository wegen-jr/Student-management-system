import { Document } from '@react-pdf/renderer';
import { StudentSlipPage } from './StudentSlipPDF';

export const BatchSlipsPDF = ({ students }) => (
  <Document>
    {students.map(student => (
      <StudentSlipPage key={student.student_id} student={student} />
    ))}
  </Document>
);