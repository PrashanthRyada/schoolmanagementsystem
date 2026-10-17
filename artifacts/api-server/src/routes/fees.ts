import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateFeeBody,
  CreateFeeResponse,
  DeleteFeeParams,
  GetFeesQueryParams,
  GetFeesResponse,
  UpdateFeeBody,
  UpdateFeeParams,
  UpdateFeeResponse,
} from "@workspace/api-zod";
import { db, feesTable, studentsTable } from "@workspace/db";

const router: IRouter = Router();

function feeStatus(amount: number, paidAmount: number) {
  if (paidAmount <= 0) return "pending";
  if (paidAmount >= amount) return "paid";
  return "partial";
}

async function feeRows(studentId?: number) {
  const rows = await db
    .select({
      id: feesTable.id,
      studentId: feesTable.studentId,
      studentName: studentsTable.name,
      admissionNumber: studentsTable.admissionNumber,
      period: feesTable.period,
      amount: feesTable.amount,
      paidAmount: feesTable.paidAmount,
      dueDate: feesTable.dueDate,
    })
    .from(feesTable)
    .leftJoin(studentsTable, eq(feesTable.studentId, studentsTable.id))
    .where(studentId !== undefined ? eq(feesTable.studentId, studentId) : undefined)
    .orderBy(feesTable.dueDate);
  return rows.map((row) => ({
    ...row,
    studentName: row.studentName ?? `Student ${row.studentId}`,
    admissionNumber: row.admissionNumber ?? "—",
    status: feeStatus(row.amount, row.paidAmount),
  }));
}

router.get("/fees", async (req, res): Promise<void> => {
  const params = GetFeesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await feeRows(params.data.studentId);
  res.json(
    GetFeesResponse.parse(
      params.data.status ? rows.filter((row) => row.status === params.data.status) : rows,
    ),
  );
});

router.post("/fees", async (req, res): Promise<void> => {
  const parsed = CreateFeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { studentId, ...input } = parsed.data;
  const paidAmount = input.paidAmount ?? 0;
  if (paidAmount > input.amount) {
    res.status(400).json({ error: "Paid amount cannot exceed the invoice amount." });
    return;
  }
  const [student] = await db
    .select({ id: studentsTable.id })
    .from(studentsTable)
    .where(eq(studentsTable.id, studentId));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  const [created] = await db
    .insert(feesTable)
    .values({
      ...input,
      studentId,
      paidAmount,
      dueDate: input.dueDate.toISOString().slice(0, 10),
    })
    .returning({ id: feesTable.id });
  const [result] = await feeRows(studentId).then((rows) =>
    rows.filter((row) => row.id === created.id),
  );
  res.status(201).json(CreateFeeResponse.parse(result));
});

router.patch("/fees/:feeId", async (req, res): Promise<void> => {
  const params = UpdateFeeParams.safeParse(req.params);
  const parsed = UpdateFeeBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: params.error?.message ?? parsed.error?.message });
    return;
  }
  const [current] = await db
    .select()
    .from(feesTable)
    .where(eq(feesTable.id, params.data.feeId));
  if (!current) {
    res.status(404).json({ error: "Fee invoice not found" });
    return;
  }
  const amount = parsed.data.amount ?? current.amount;
  const paidAmount = parsed.data.paidAmount ?? current.paidAmount;
  if (paidAmount > amount) {
    res.status(400).json({ error: "Paid amount cannot exceed the invoice amount." });
    return;
  }
  const [updated] = await db
    .update(feesTable)
    .set({
      ...parsed.data,
      dueDate: parsed.data.dueDate?.toISOString().slice(0, 10),
    })
    .where(eq(feesTable.id, params.data.feeId))
    .returning();
  const [result] = await feeRows(updated.studentId).then((rows) =>
    rows.filter((row) => row.id === updated.id),
  );
  res.json(UpdateFeeResponse.parse(result));
});

router.delete("/fees/:feeId", async (req, res): Promise<void> => {
  const params = DeleteFeeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(feesTable)
    .where(eq(feesTable.id, params.data.feeId))
    .returning({ id: feesTable.id });
  if (!deleted) {
    res.status(404).json({ error: "Fee invoice not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
