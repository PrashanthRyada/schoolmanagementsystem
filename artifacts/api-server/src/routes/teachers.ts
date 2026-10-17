import { eq, ilike, inArray, or } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateTeacherBody,
  CreateTeacherResponse,
  DeleteTeacherParams,
  GetTeacherByIdParams,
  GetTeacherByIdResponse,
  GetTeachersQueryParams,
  GetTeachersResponse,
  UpdateTeacherBody,
  UpdateTeacherParams,
  UpdateTeacherResponse,
} from "@workspace/api-zod";
import { classesTable, db, studentsTable, teachersTable } from "@workspace/db";

const router: IRouter = Router();

async function getTeacherList(where?: any) {
  const teachers = await db
    .select()
    .from(teachersTable)
    .where(where)
    .orderBy(teachersTable.name);

  if (!teachers.length) return [];

  const teacherIds = teachers.map((t) => t.id);
  const classes = await db
    .select({
      id: classesTable.id,
      name: classesTable.name,
      grade: classesTable.grade,
      section: classesTable.section,
      room: classesTable.room,
      teacherId: classesTable.teacherId,
    })
    .from(classesTable)
    .where(inArray(classesTable.teacherId, teacherIds));

  const classIds = classes.map((c) => c.id);
  const students = classIds.length
    ? await db
        .select({
          id: studentsTable.id,
          classId: studentsTable.classId,
        })
        .from(studentsTable)
        .where(inArray(studentsTable.classId, classIds))
    : [];

  return teachers.map((teacher) => {
    const teacherClasses = classes
      .filter((c) => c.teacherId === teacher.id)
      .map((c) => {
        const classStudents = students.filter((s) => s.classId === c.id);
        return {
          id: c.id,
          name: c.name,
          grade: c.grade,
          section: c.section,
          room: c.room,
          studentCount: classStudents.length,
        };
      });

    const teacherClassIds = new Set(teacherClasses.map((c) => c.id));
    const teacherStudents = students.filter(
      (s) => s.classId !== null && teacherClassIds.has(s.classId),
    );

    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      department: teacher.department,
      qualification: teacher.qualification,
      avatarUrl: teacher.avatarUrl ?? null,
      classes: teacherClasses,
      studentCount: teacherStudents.length,
    };
  });
}

router.get("/teachers", async (req, res): Promise<void> => {
  const params = GetTeachersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const search = params.data?.search?.trim();
  const where = search
    ? or(
        ilike(teachersTable.name, `%${search}%`),
        ilike(teachersTable.subject, `%${search}%`),
        ilike(teachersTable.department, `%${search}%`),
        ilike(teachersTable.email, `%${search}%`),
      )
    : undefined;

  const result = await getTeacherList(where);
  res.json(GetTeachersResponse.parse(result));
});

router.post("/teachers", async (req, res): Promise<void> => {
  const parsed = CreateTeacherBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(teachersTable)
    .values({
      ...parsed.data,
      phone: parsed.data.phone ?? "",
      qualification: parsed.data.qualification ?? "",
      avatarUrl: parsed.data.avatarUrl ?? null,
    })
    .returning();

  const [teacher] = await getTeacherList(eq(teachersTable.id, created.id));
  res.status(201).json(CreateTeacherResponse.parse(teacher));
});

router.get("/teachers/:teacherId", async (req, res): Promise<void> => {
  const params = GetTeacherByIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [teacher] = await getTeacherList(eq(teachersTable.id, params.data.teacherId));
  if (!teacher) {
    res.status(404).json({ error: "Teacher not found" });
    return;
  }

  const classIds = teacher.classes.map((c) => c.id);
  const students = classIds.length
    ? await db
        .select({
          id: studentsTable.id,
          name: studentsTable.name,
          admissionNumber: studentsTable.admissionNumber,
          grade: studentsTable.grade,
          section: studentsTable.section,
          email: studentsTable.email,
          phone: studentsTable.phone,
          classId: studentsTable.classId,
        })
        .from(studentsTable)
        .where(inArray(studentsTable.classId, classIds))
        .orderBy(studentsTable.name)
    : [];

  const classMap = new Map(teacher.classes.map((c) => [c.id, c.name]));
  const formattedStudents = students.map((s) => ({
    id: s.id,
    name: s.name,
    admissionNumber: s.admissionNumber,
    grade: s.grade,
    section: s.section,
    className: s.classId ? classMap.get(s.classId) ?? null : null,
    email: s.email,
    phone: s.phone,
  }));

  res.json(
    GetTeacherByIdResponse.parse({
      ...teacher,
      students: formattedStudents,
    }),
  );
});

router.patch("/teachers/:teacherId", async (req, res): Promise<void> => {
  const params = UpdateTeacherParams.safeParse(req.params);
  const parsed = UpdateTeacherBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: params.error?.message ?? parsed.error?.message });
    return;
  }

  const [updated] = await db
    .update(teachersTable)
    .set(parsed.data)
    .where(eq(teachersTable.id, params.data.teacherId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Teacher not found" });
    return;
  }

  const [teacher] = await getTeacherList(eq(teachersTable.id, updated.id));
  res.json(UpdateTeacherResponse.parse(teacher));
});

router.delete("/teachers/:teacherId", async (req, res): Promise<void> => {
  const params = DeleteTeacherParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(teachersTable)
    .where(eq(teachersTable.id, params.data.teacherId))
    .returning({ id: teachersTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Teacher not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
