import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  AddStudentPerformanceBody,
  AddStudentPerformanceParams,
  AddStudentPerformanceResponse,
  CreateStudentBody,
  CreateStudentResponse,
  DeleteStudentParams,
  DeleteStudentResponse,
  GetStudentsQueryParams,
  GetStudentsResponse,
  GetStudentPerformanceParams,
  GetStudentPerformanceResponse,
  UpdateStudentBody,
  UpdateStudentParams,
  UpdateStudentResponse,
} from "@workspace/api-zod";
import {
  attendanceTable,
  classesTable,
  db,
  performanceTable,
  studentsTable,
} from "@workspace/db";

const router: IRouter = Router();

async function buildStudentRows(where: ReturnType<typeof and> | undefined) {
  const rows = await db
    .select({
      id: studentsTable.id,
      name: studentsTable.name,
      admissionNumber: studentsTable.admissionNumber,
      grade: studentsTable.grade,
      section: studentsTable.section,
      email: studentsTable.email,
      phone: studentsTable.phone,
      avatarUrl: studentsTable.avatarUrl,
      classId: studentsTable.classId,
      className: classesTable.name,
    })
    .from(studentsTable)
    .leftJoin(classesTable, eq(studentsTable.classId, classesTable.id))
    .where(where)
    .orderBy(studentsTable.name);

  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const [scores, attendance] = await Promise.all([
    db
      .select({
        studentId: performanceTable.studentId,
        score: performanceTable.score,
        maxScore: performanceTable.maxScore,
      })
      .from(performanceTable)
      .where(inArray(performanceTable.studentId, ids)),
    db
      .select({
        personId: attendanceTable.personId,
        status: attendanceTable.status,
      })
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.personType, "student"),
          inArray(attendanceTable.personId, ids),
        ),
      ),
  ]);

  return rows.map((student) => {
    const studentScores = scores.filter((score) => score.studentId === student.id);
    const averageScore = studentScores.length
      ? studentScores.reduce((sum, score) => sum + (score.score / score.maxScore) * 100, 0) /
        studentScores.length
      : 0;
    const recordedAttendance = attendance.filter((record) => record.personId === student.id);
    const attendanceRate = recordedAttendance.length
      ? (recordedAttendance.filter((record) => record.status === "present").length /
          recordedAttendance.length) *
        100
      : 0;
    return {
      ...student,
      avatarUrl: student.avatarUrl ?? null,
      classId: student.classId ?? null,
      className: student.className ?? null,
      attendanceRate: Number(attendanceRate.toFixed(1)),
      averageScore: Number(averageScore.toFixed(1)),
    };
  });
}

router.get("/students", async (req, res): Promise<void> => {
  const params = GetStudentsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const conditions = [];
  if (params.data.search?.trim()) {
    const term = `%${params.data.search.trim()}%`;
    conditions.push(
      or(
        ilike(studentsTable.name, term),
        ilike(studentsTable.admissionNumber, term),
        ilike(studentsTable.email, term),
      ),
    );
  }
  if (params.data.classId !== undefined) {
    conditions.push(eq(studentsTable.classId, params.data.classId));
  }
  const where = and(...conditions);
  res.json(GetStudentsResponse.parse(await buildStudentRows(where)));
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [student] = await db.insert(studentsTable).values({
    ...parsed.data,
    email: parsed.data.email ?? "",
    phone: parsed.data.phone ?? "",
    avatarUrl: parsed.data.avatarUrl ?? null,
  }).returning();
  const [result] = await buildStudentRows(eq(studentsTable.id, student.id));
  res.status(201).json(CreateStudentResponse.parse(result));
});

router.patch("/students/:studentId", async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: params.error?.message ?? parsed.error?.message });
    return;
  }
  const [updated] = await db
    .update(studentsTable)
    .set(parsed.data)
    .where(eq(studentsTable.id, params.data.studentId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  const [result] = await buildStudentRows(eq(studentsTable.id, updated.id));
  res.json(UpdateStudentResponse.parse(result));
});

router.delete("/students/:studentId", async (req, res): Promise<void> => {
  const params = DeleteStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.transaction(async (tx) => {
    await tx
      .delete(attendanceTable)
      .where(
        and(
          eq(attendanceTable.personType, "student"),
          eq(attendanceTable.personId, params.data.studentId),
        ),
      );
    return tx
      .delete(studentsTable)
      .where(eq(studentsTable.id, params.data.studentId))
      .returning({ id: studentsTable.id });
  });
  if (!deleted) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.status(204).end();
  DeleteStudentResponse.parse(undefined);
});

router.get("/students/:studentId/performance", async (req, res): Promise<void> => {
  const params = GetStudentPerformanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const records = await db
    .select()
    .from(performanceTable)
    .where(eq(performanceTable.studentId, params.data.studentId))
    .orderBy(desc(performanceTable.recordedAt), performanceTable.subject);
  res.json(GetStudentPerformanceResponse.parse(records));
});

router.post("/students/:studentId/performance", async (req, res): Promise<void> => {
  const params = AddStudentPerformanceParams.safeParse(req.params);
  const parsed = AddStudentPerformanceBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: params.error?.message ?? parsed.error?.message });
    return;
  }
  if (parsed.data.score > parsed.data.maxScore) {
    res.status(400).json({ error: "Score cannot exceed the maximum score." });
    return;
  }
  const [student] = await db
    .select({ id: studentsTable.id })
    .from(studentsTable)
    .where(eq(studentsTable.id, params.data.studentId));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  const [record] = await db
    .insert(performanceTable)
    .values({
      ...parsed.data,
      studentId: params.data.studentId,
      recordedAt: parsed.data.recordedAt.toISOString().slice(0, 10),
    })
    .returning();
  res.status(201).json(AddStudentPerformanceResponse.parse(record));
});

export default router;
