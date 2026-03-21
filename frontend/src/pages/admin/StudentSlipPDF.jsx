import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  section: { marginBottom: 10 },
  header: { fontSize: 14, marginBottom: 10, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderBottomStyle: 'solid',
    paddingVertical: 4,
    marginHorizontal: 5,
  },
  cell: { flex: 1, padding: 4 },
  tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
  studentInfo: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  infoText: {
    marginRight: 15,
  },
  signatureLine: {
    marginTop: 20,
  },
  spacer: {
    marginTop: 20,    // vertical gap between slips
  },
});

// A single page (without wrapping Document)
export const StudentSlipPage = ({ student }) => (
  <Page size="A4" style={styles.page}>
    {/* First slip */}
    {/* Student info – bold and spaced */}
    <View style={[styles.row, styles.studentInfo]}>
      <Text style={styles.infoText}>Student Name: {student.full_name}</Text>
      <Text style={styles.infoText}>ID: {student.student_id}</Text>
      <Text style={styles.infoText}>Year: {student.year}</Text>
      <Text style={{ marginRight: 0 }}>Semester: {student.semester}</Text>
    </View>

    {/* Application text */}
    <View style={styles.row}>
      <Text style={styles.infoText}>
        I am applying to be registered for the following courses
      </Text>
      <Text style={{ marginRight: 0 }}>Signature -------------------</Text>
    </View>

    {/* Courses table */}
    <View>
      <View style={[styles.row, styles.tableHeader]}>
        <Text style={styles.cell}>Course Name</Text>
        <Text style={styles.cell}>Code</Text>
        <Text style={styles.cell}>Credit</Text>
        <Text style={styles.cell}>Category</Text>
      </View>
      {student.courses.map((course, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.cell}>{course.course_name}</Text>
          <Text style={styles.cell}>{course.course_code}</Text>
          <Text style={styles.cell}>{course.credit_hour}</Text>
          <Text style={styles.cell}>{course.category || '—'}</Text>
        </View>
      ))}
    </View>

    {/* Advisor and date section */}
    <View style={[styles.row, styles.signatureLine]}>
      <Text style={styles.infoText}>Advisor Name: _________________</Text>
      <Text style={styles.infoText}>Signature: _________________</Text>
      <Text style={{ marginRight: 0 }}>Registration Date: _________________</Text>
    </View>

    {/* Vertical gap between slips */}
    <View style={styles.spacer} />

    {/* Second slip – identical content */}
    {/* Student info – bold and spaced */}
    <View style={[styles.row, styles.studentInfo]}>
      <Text style={styles.infoText}>Student Name: {student.full_name}</Text>
      <Text style={styles.infoText}>ID: {student.student_id}</Text>
      <Text style={styles.infoText}>Year: {student.year}</Text>
      <Text style={{ marginRight: 0 }}>Semester: {student.semester}</Text>
    </View>

    {/* Application text */}
    <View style={styles.row}>
      <Text style={styles.infoText}>
        I am applying to be registered for the following courses
      </Text>
      <Text style={{ marginRight: 0 }}>Signature -------------------</Text>
    </View>

    {/* Courses table */}
    <View>
      <View style={[styles.row, styles.tableHeader]}>
        <Text style={styles.cell}>Course Name</Text>
        <Text style={styles.cell}>Code</Text>
        <Text style={styles.cell}>Credit</Text>
        <Text style={styles.cell}>Category</Text>
      </View>
      {student.courses.map((course, idx) => (
        <View key={idx} style={styles.row}>
          <Text style={styles.cell}>{course.course_name}</Text>
          <Text style={styles.cell}>{course.course_code}</Text>
          <Text style={styles.cell}>{course.credit_hour}</Text>
          <Text style={styles.cell}>{course.category || '—'}</Text>
        </View>
      ))}
    </View>

    {/* Advisor and date section */}
    <View style={[styles.row, styles.signatureLine]}>
      <Text style={styles.infoText}>Advisor Name: _________________</Text>
      <Text style={styles.infoText}>Signature: _________________</Text>
      <Text style={{ marginRight: 0 }}>Registration Date: _________________</Text>
    </View>
  </Page>
);

// Convenience component for single PDF (wraps the page in a Document)
export const StudentSlipPDF = ({ student }) => (
  <Document>
    <StudentSlipPage student={student} />
    <StudentSlipPage student={student} />
  </Document>
);