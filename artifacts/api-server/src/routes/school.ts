import { count, eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  ClassInput,
  ClassUpdate,
  CreateClassBody,
  CreateClassResponse,
  DeleteClassParams,
  GetClassesResponse,
  GetSchoolOverviewResponse,
  GetStaffResponse,
  UpdateClassBody,
  UpdateClassParams,
  UpdateClassResponse,
} from "@workspace/api-zod";
import {
  attendanceTable,
  classesTable,
  db,
  feesTable,
  staffTable,
  studentsTable,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/school/overview", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const [[studentCount], [staffCount], [classCount], feeRows, todayAttendance] =
    await Promise.all([
      db.select({ value: count() }).from(studentsTable),
      db.select({ value: count() }).from(staffTable),
      db.select({ value: count() }).from(classesTable),
      db.select().from(feesTable),
      db
        .select({
          personId: attendanceTable.personId,
          personType: attendanceTable.personType,
          status: attendanceTable.status,
        })
        .from(attendanceTable)
        .where(eq(attendanceTable.date, today)),
    ]);

  const amountTotal = feeRows.reduce((sum, fee) => sum + fee.amount, 0);
  const paidAmount = feeRows.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const pendingStudents = new Set(
    feeRows.filter((fee) => fee.paidAmount < fee.amount).map((fee) => fee.studentId),
  );
  const billedStudents = new Set(feeRows.map((fee) => fee.studentId));

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setMonth(monthStart.getMonth() - 5);
  const trend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(monthStart);
    date.setMonth(monthStart.getMonth() + index);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthFees = feeRows.filter((fee) => {
      const due = new Date(`${fee.dueDate}T00:00:00`);
      return due.getFullYear() === year && due.getMonth() === month;
    });
    return {
      month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      paid: monthFees.reduce((sum, fee) => sum + fee.paidAmount, 0),
      pending: monthFees.reduce((sum, fee) => sum + fee.amount - fee.paidAmount, 0),
    };
  });

  res.json(
    GetSchoolOverviewResponse.parse({
      studentCount: studentCount.value,
      staffCount: staffCount.value,
      classCount: classCount.value,
      attendance: {
        studentPresent: todayAttendance.filter(
          (record) => record.personType === "student" && record.status === "present",
        ).length,
        studentTotal: studentCount.value,
        staffPresent: todayAttendance.filter(
          (record) => record.personType === "staff" && record.status === "present",
        ).length,
        staffTotal: staffCount.value,
      },
      fees: {
        paidAmount,
        totalAmount: amountTotal,
        pendingAmount: Math.max(0, amountTotal - paidAmount),
        pendingStudents: pendingStudents.size,
        paidStudents: Math.max(0, billedStudents.size - pendingStudents.size),
      },
      feeTrend: trend,
    }),
  );
});

router.get("/staff", async (_req, res): Promise<void> => {
  const staff = await db.select().from(staffTable).orderBy(staffTable.name);
  res.json(GetStaffResponse.parse(staff));
});

async function getClassList() {
  const rows = await db
    .select({
      id: classesTable.id,
      name: classesTable.name,
      grade: classesTable.grade,
      section: classesTable.section,
      teacherId: classesTable.teacherId,
      teacherName: staffTable.name,
      room: classesTable.room,
    })
    .from(classesTable)
    .leftJoin(staffTable, eq(classesTable.teacherId, staffTable.id))
    .orderBy(classesTable.grade, classesTable.section);
  const students = rows.length
    ? await db
        .select({ id: studentsTable.id, classId: studentsTable.classId })
        .from(studentsTable)
        .where(inArray(studentsTable.classId, rows.map((item) => item.id)))
    : [];
  return rows.map((classRow) => {
    const mapped = students.filter((student) => student.classId === classRow.id);
    return {
      ...classRow,
      teacherName: classRow.teacherName ?? null,
      studentIds: mapped.map((student) => student.id),
      studentCount: mapped.length,
    };
  });
}

async function mapStudentsToClass(classId: number, studentIds: number[]) {
  await db.update(studentsTable).set({ classId: null }).where(eq(studentsTable.classId, classId));
  if (studentIds.length) {
    await db
      .update(studentsTable)
      .set({ classId })
      .where(inArray(studentsTable.id, studentIds));
  }
}

router.get("/classes", async (_req, res): Promise<void> => {
  res.json(GetClassesResponse.parse(await getClassList()));
});

router.post("/classes", async (req, res): Promise<void> => {
  const parsed = CreateClassBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const input: ClassInput = parsed.data;
  const { studentIds = [], ...classData } = input;
  const [created] = await db.insert(classesTable).values({
    ...classData,
    teacherId: classData.teacherId ?? null,
  }).returning();
  await mapStudentsToClass(created.id, studentIds);
  const result = (await getClassList()).find((row) => row.id === created.id);
  res.status(201).json(CreateClassResponse.parse(result));
});

router.patch("/classes/:classId", async (req, res): Promise<void> => {
  const params = UpdateClassParams.safeParse(req.params);
  const parsed = UpdateClassBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: params.error?.message ?? parsed.error?.message });
    return;
  }
  const input: ClassUpdate = parsed.data;
  const { studentIds, ...classData } = input;
  const [updated] = await db
    .update(classesTable)
    .set(classData)
    .where(eq(classesTable.id, params.data.classId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Class not found" });
    return;
  }
  if (studentIds !== undefined) {
    await mapStudentsToClass(updated.id, studentIds);
  }
  const result = (await getClassList()).find((row) => row.id === updated.id);
  res.json(UpdateClassResponse.parse(result));
});

router.delete("/classes/:classId", async (req, res): Promise<void> => {
  const params = DeleteClassParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(classesTable)
    .where(eq(classesTable.id, params.data.classId))
    .returning({ id: classesTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Class not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
