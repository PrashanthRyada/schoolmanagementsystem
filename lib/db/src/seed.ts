import { count, eq } from "drizzle-orm";
import {
  attendanceTable,
  classesTable,
  eventsTable,
  feesTable,
  homepageMediaTable,
  performanceTable,
  staffTable,
  studentsTable,
} from "./schema";

export async function seedDatabase(db: any) {
  const [studentCount] = await db.select({ value: count() }).from(studentsTable);
  if (studentCount && Number(studentCount.value) > 0) {
    return; // Database is already seeded
  }

  // 1. Staff
  const staffData = [
    { name: "Dr. Alistair Finch", role: "Principal", email: "principal@willowcreek.edu", department: "Administration" },
    { name: "Elena Rostova", role: "Head of Science", email: "elena.rostova@willowcreek.edu", department: "Science" },
    { name: "Marcus Vance", role: "Mathematics Lead", email: "marcus.vance@willowcreek.edu", department: "Mathematics" },
    { name: "Sarah Jenkins", role: "Humanities & History", email: "sarah.jenkins@willowcreek.edu", department: "Humanities" },
    { name: "David O'Connor", role: "Athletics Director", email: "david.oconnor@willowcreek.edu", department: "Athletics" },
    { name: "Amina Patel", role: "Art & Music Director", email: "amina.patel@willowcreek.edu", department: "Arts" },
  ];
  const insertedStaff = await db.insert(staffTable).values(staffData).returning();

  // 2. Classes
  const classData = [
    { name: "Cedar Room", grade: "9", section: "A", teacherId: insertedStaff[1]?.id ?? null, room: "Building A - 101" },
    { name: "Maple Room", grade: "10", section: "B", teacherId: insertedStaff[2]?.id ?? null, room: "Building B - 204" },
    { name: "Oak Studio", grade: "11", section: "A", teacherId: insertedStaff[5]?.id ?? null, room: "Arts Wing - 12" },
    { name: "Willow Lab", grade: "12", section: "Advanced", teacherId: insertedStaff[3]?.id ?? null, room: "Science Block - 3" },
  ];
  const insertedClasses = await db.insert(classesTable).values(classData).returning();

  // 3. Students
  const studentData = [
    { name: "Aarav Sharma", admissionNumber: "WC-2024-001", grade: "9", section: "A", email: "aarav.sharma@family.com", phone: "+91 98765 43210", classId: insertedClasses[0]?.id },
    { name: "Diya Patel", admissionNumber: "WC-2024-002", grade: "9", section: "A", email: "diya.patel@family.com", phone: "+91 98765 43211", classId: insertedClasses[0]?.id },
    { name: "Rohan Iyer", admissionNumber: "WC-2024-003", grade: "10", section: "B", email: "rohan.iyer@family.com", phone: "+91 98765 43212", classId: insertedClasses[1]?.id },
    { name: "Ananya Sen", admissionNumber: "WC-2024-004", grade: "10", section: "B", email: "ananya.sen@family.com", phone: "+91 98765 43213", classId: insertedClasses[1]?.id },
    { name: "Kabir Mehta", admissionNumber: "WC-2024-005", grade: "11", section: "A", email: "kabir.mehta@family.com", phone: "+91 98765 43214", classId: insertedClasses[2]?.id },
    { name: "Zoya Khan", admissionNumber: "WC-2024-006", grade: "11", section: "A", email: "zoya.khan@family.com", phone: "+91 98765 43215", classId: insertedClasses[2]?.id },
    { name: "Liam Chen", admissionNumber: "WC-2024-007", grade: "12", section: "Advanced", email: "liam.chen@family.com", phone: "+91 98765 43216", classId: insertedClasses[3]?.id },
    { name: "Maya Thompson", admissionNumber: "WC-2024-008", grade: "12", section: "Advanced", email: "maya.thompson@family.com", phone: "+91 98765 43217", classId: insertedClasses[3]?.id },
  ];
  const insertedStudents = await db.insert(studentsTable).values(studentData).returning();

  // 4. Attendance (Today)
  const today = new Date().toISOString().slice(0, 10);
  const attendanceData = [
    ...insertedStudents.map((s: any, idx: number) => ({
      personId: s.id,
      personType: "student",
      classId: s.classId,
      date: today,
      status: idx === 1 ? "late" : idx === 5 ? "absent" : "present",
      note: idx === 1 ? "School bus delay" : null,
    })),
    ...insertedStaff.map((st: any) => ({
      personId: st.id,
      personType: "staff",
      classId: null,
      date: today,
      status: "present",
      note: null,
    })),
  ];
  await db.insert(attendanceTable).values(attendanceData);

  // 5. Fees
  const feeData = [
    { studentId: insertedStudents[0].id, period: "Term 1 - 2024", amount: 45000, paidAmount: 45000, dueDate: "2024-08-15" },
    { studentId: insertedStudents[0].id, period: "Term 2 - 2024", amount: 45000, paidAmount: 30000, dueDate: "2024-12-15" },
    { studentId: insertedStudents[1].id, period: "Term 1 - 2024", amount: 45000, paidAmount: 45000, dueDate: "2024-08-15" },
    { studentId: insertedStudents[1].id, period: "Term 2 - 2024", amount: 45000, paidAmount: 45000, dueDate: "2024-12-15" },
    { studentId: insertedStudents[2].id, period: "Term 1 - 2024", amount: 48000, paidAmount: 48000, dueDate: "2024-08-15" },
    { studentId: insertedStudents[2].id, period: "Term 2 - 2024", amount: 48000, paidAmount: 0, dueDate: "2024-12-15" },
    { studentId: insertedStudents[3].id, period: "Term 2 - 2024", amount: 48000, paidAmount: 48000, dueDate: "2024-12-15" },
    { studentId: insertedStudents[4].id, period: "Term 2 - 2024", amount: 52000, paidAmount: 25000, dueDate: "2024-12-15" },
    { studentId: insertedStudents[5].id, period: "Term 2 - 2024", amount: 52000, paidAmount: 52000, dueDate: "2024-12-15" },
    { studentId: insertedStudents[6].id, period: "Term 2 - 2024", amount: 55000, paidAmount: 55000, dueDate: "2024-12-15" },
    { studentId: insertedStudents[7].id, period: "Term 2 - 2024", amount: 55000, paidAmount: 15000, dueDate: "2024-12-15" },
  ];
  await db.insert(feesTable).values(feeData);

  // 6. Student Performance
  const performanceData = [
    { studentId: insertedStudents[0].id, subject: "Mathematics", assessment: "Diagnostic Quiz", score: 88, maxScore: 100, recordedAt: "2024-09-10" },
    { studentId: insertedStudents[0].id, subject: "Mathematics", assessment: "Midterm Exam", score: 92, maxScore: 100, recordedAt: "2024-10-14" },
    { studentId: insertedStudents[0].id, subject: "Science", assessment: "Lab Assessment", score: 85, maxScore: 100, recordedAt: "2024-09-22" },
    { studentId: insertedStudents[1].id, subject: "Mathematics", assessment: "Midterm Exam", score: 95, maxScore: 100, recordedAt: "2024-10-14" },
    { studentId: insertedStudents[2].id, subject: "Mathematics", assessment: "Midterm Exam", score: 79, maxScore: 100, recordedAt: "2024-10-14" },
    { studentId: insertedStudents[3].id, subject: "English", assessment: "Essay Analysis", score: 91, maxScore: 100, recordedAt: "2024-09-30" },
    { studentId: insertedStudents[4].id, subject: "Art & Design", assessment: "Studio Portfolio", score: 96, maxScore: 100, recordedAt: "2024-10-05" },
    { studentId: insertedStudents[6].id, subject: "Physics", assessment: "Mechanics Unit Test", score: 90, maxScore: 100, recordedAt: "2024-10-12" },
  ];
  await db.insert(performanceTable).values(performanceData);

  // 7. Events
  const eventData = [
    {
      title: "Annual Science & Innovation Fair",
      category: "Academics",
      date: "2025-03-24",
      time: "9:00 AM - 3:00 PM",
      location: "Main Gymnasium & Science Labs",
      description: "Student projects, interactive demos, and keynote address from visiting scientists.",
      color: "#4d7857",
    },
    {
      title: "Spring Cultural & Arts Festival",
      category: "Culture",
      date: "2025-04-12",
      time: "10:00 AM - 5:00 PM",
      location: "Campus Amphitheatre",
      description: "Music performances, folk dances, art exhibitions, and culinary traditions celebrated by student families.",
      color: "#cf8c67",
    },
    {
      title: "Inter-House Athletics Championship",
      category: "Sports",
      date: "2025-05-02",
      time: "8:30 AM - 2:00 PM",
      location: "Willow Creek Sports Ground",
      description: "Track and field competitions, relay races, and award presentation ceremony.",
      color: "#466e85",
    },
    {
      title: "Parent-Teacher Leadership Forum",
      category: "Community",
      date: "2025-05-18",
      time: "4:00 PM - 7:00 PM",
      location: "Auditorium Hall B",
      description: "Discussion on curriculum progress, student well-being initiatives, and school developments.",
      color: "#7e5e8e",
    },
  ];
  await db.insert(eventsTable).values(eventData);

  // 8. Homepage Media
  const mediaData = [
    {
      title: "A place to learn, grow and belong",
      caption: "A look at the bright moments that make every school day meaningful across our campus.",
      mediaType: "image",
      url: "/campus-courtyard.jpg",
      isActive: true,
      sortOrder: 1,
    },
    {
      title: "Celebrating every culture and story",
      caption: "Our community brings its traditions, creativity and passions together every season.",
      mediaType: "image",
      url: "/cultural-day.jpg",
      isActive: true,
      sortOrder: 2,
    },
    {
      title: "Curiosity and exploration in every classroom",
      caption: "Hands-on projects and collaborative inquiry spark discoveries for learners of all ages.",
      mediaType: "image",
      url: "/young-makers.jpg",
      isActive: true,
      sortOrder: 3,
    },
    {
      title: "Modern science and discovery labs",
      caption: "Equipped for experiment, research and scientific breakthroughs.",
      mediaType: "image",
      url: "/images/science-lab.jpg",
      isActive: true,
      sortOrder: 4,
    },
    {
      title: "Vibrant campus life",
      caption: "From courtyard discussions to athletics, learning happens everywhere.",
      mediaType: "image",
      url: "/images/campus-life.jpg",
      isActive: true,
      sortOrder: 5,
    },
  ];
  await db.insert(homepageMediaTable).values(mediaData);
}
