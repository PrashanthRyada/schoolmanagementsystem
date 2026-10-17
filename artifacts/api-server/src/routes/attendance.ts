import { and, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetAttendanceQueryParams,
  GetAttendanceResponse,
  MarkAttendanceBody,
  MarkAttendanceResponse,
} from "@workspace/api-zod";
import {
  attendanceTable,
  classesTable,
  db,
  staffTable,
  studentsTable,
} from "@workspace/db";

const router: IRouter = Router();
const dateString = (date: Date) => date.toISOString().slice(0, 10);

async function attendanceForDay(date: string, personType?: string, classId?: number) {
  const rows = await db
    .select({
      id: attendanceTable.id,
      personId: attendanceTable.personId,
      personType: attendanceTable.personType,
      studentName: studentsTable.name,
      staffName: staffTable.name,
      classId: attendanceTable.classId,
      className: classesTable.name,
      date: attendanceTable.date,
      status: attendanceTable.status,
      note: attendanceTable.note,
    })
    .from(attendanceTable)
    .leftJoin(
      studentsTable,
      and(
        eq(attendanceTable.personType, "student"),
        eq(attendanceTable.personId, studentsTable.id),
      ),
    )
    .leftJoin(
      staffTable,
      and(eq(attendanceTable.personType, "staff"), eq(attendanceTable.personId, staffTable.id)),
    )
    .leftJoin(classesTable, eq(attendanceTable.classId, classesTable.id))
    .where(
      and(
        eq(attendanceTable.date, date),
        personType ? eq(attendanceTable.personType, personType) : undefined,
        classId !== undefined ? eq(attendanceTable.classId, classId) : undefined,
      ),
    )
    .orderBy(attendanceTable.personType, studentsTable.name, staffTable.name);

  return rows.map((row) => ({
    id: row.id,
    personId: row.personId,
    personType: row.personType,
    personName: row.studentName ?? row.staffName ?? `Person ${row.personId}`,
    classId: row.classId ?? null,
    className: row.className ?? null,
    date: row.date,
    status: row.status,
    note: row.note ?? null,
  }));
}

router.get("/attendance", async (req, res): Promise<void> => {
  const queryDate =
    typeof req.query.date === "string"
      ? new Date(`${req.query.date}T00:00:00.000Z`)
      : req.query.date;
  const params = GetAttendanceQueryParams.safeParse({ ...req.query, date: queryDate });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const records = await attendanceForDay(
    dateString(params.data.date),
    params.data.personType,
    params.data.classId,
  );
  res.json(GetAttendanceResponse.parse(records));
});

router.post("/attendance", async (req, res): Promise<void> => {
  const parsed = MarkAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const input = parsed.data;
  let personName: string | undefined;
  let classId = input.classId ?? null;
  if (input.personType === "student") {
    const [student] = await db
      .select({ id: studentsTable.id, name: studentsTable.name, classId: studentsTable.classId })
      .from(studentsTable)
      .where(eq(studentsTable.id, input.personId));
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    personName = student.name;
    classId = student.classId ?? classId;
  } else {
    const [staff] = await db
      .select({ id: staffTable.id, name: staffTable.name })
      .from(staffTable)
      .where(eq(staffTable.id, input.personId));
    if (!staff) {
      res.status(404).json({ error: "Staff member not found" });
      return;
    }
    personName = staff.name;
    classId = null;
  }

  await db
    .insert(attendanceTable)
    .values({
      personId: input.personId,
      personType: input.personType,
      classId,
      date: dateString(input.date),
      status: input.status,
      note: input.note ?? null,
    })
    .onConflictDoUpdate({
      target: [attendanceTable.personId, attendanceTable.personType, attendanceTable.date],
      set: { classId, status: input.status, note: input.note ?? null },
    });

  const date = dateString(input.date);
  const [record] = await attendanceForDay(date, input.personType, classId ?? undefined).then(
    (items) => items.filter((item) => item.personId === input.personId),
  );
  if (!record || record.personName !== personName) {
    res.status(500).json({ error: "Attendance was saved but could not be retrieved." });
    return;
  }
  res.json(MarkAttendanceResponse.parse(record));
});

export default router;
