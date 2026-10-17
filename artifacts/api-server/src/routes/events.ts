import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateEventBody,
  CreateEventResponse,
  DeleteEventParams,
  GetEventsResponse,
  UpdateEventBody,
  UpdateEventParams,
  UpdateEventResponse,
} from "@workspace/api-zod";
import { db, eventsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/events", async (_req, res): Promise<void> => {
  const events = await db.select().from(eventsTable).orderBy(asc(eventsTable.date));
  res.json(GetEventsResponse.parse(events));
});

router.post("/events", async (req, res): Promise<void> => {
  const parsed = CreateEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [event] = await db
    .insert(eventsTable)
    .values({ ...parsed.data, date: parsed.data.date.toISOString().slice(0, 10) })
    .returning();
  res.status(201).json(CreateEventResponse.parse(event));
});

router.patch("/events/:eventId", async (req, res): Promise<void> => {
  const params = UpdateEventParams.safeParse(req.params);
  const parsed = UpdateEventBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: params.error?.message ?? parsed.error?.message });
    return;
  }
  const [event] = await db
    .update(eventsTable)
    .set({
      ...parsed.data,
      date: parsed.data.date?.toISOString().slice(0, 10),
    })
    .where(eq(eventsTable.id, params.data.eventId))
    .returning();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.json(UpdateEventResponse.parse(event));
});

router.delete("/events/:eventId", async (req, res): Promise<void> => {
  const params = DeleteEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [event] = await db
    .delete(eventsTable)
    .where(eq(eventsTable.id, params.data.eventId))
    .returning({ id: eventsTable.id });
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
