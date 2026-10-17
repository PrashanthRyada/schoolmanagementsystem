import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateHomepageMediaBody,
  CreateHomepageMediaResponse,
  DeleteHomepageMediaParams,
  GetHomepageMediaResponse,
  UpdateHomepageMediaBody,
  UpdateHomepageMediaParams,
  UpdateHomepageMediaResponse,
} from "@workspace/api-zod";
import { db, homepageMediaTable } from "@workspace/db";

const router: IRouter = Router();
const isSafeMediaUrl = (url: string) =>
  (url.startsWith("/") && !url.startsWith("//")) || /^https?:\/\/\S+$/i.test(url);

router.get("/homepage-media", async (_req, res): Promise<void> => {
  const media = await db
    .select()
    .from(homepageMediaTable)
    .orderBy(asc(homepageMediaTable.sortOrder), asc(homepageMediaTable.id));
  res.json(GetHomepageMediaResponse.parse(media));
});

router.post("/homepage-media", async (req, res): Promise<void> => {
  const parsed = CreateHomepageMediaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!isSafeMediaUrl(parsed.data.url)) {
    res.status(400).json({ error: "Use an http(s) URL or a path within the site." });
    return;
  }
  const [media] = await db
    .insert(homepageMediaTable)
    .values({
      ...parsed.data,
      caption: parsed.data.caption ?? "",
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    })
    .returning();
  res.status(201).json(CreateHomepageMediaResponse.parse(media));
});

router.patch("/homepage-media/:mediaId", async (req, res): Promise<void> => {
  const params = UpdateHomepageMediaParams.safeParse(req.params);
  const parsed = UpdateHomepageMediaBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: params.error?.message ?? parsed.error?.message });
    return;
  }
  if (parsed.data.url !== undefined && !isSafeMediaUrl(parsed.data.url)) {
    res.status(400).json({ error: "Use an http(s) URL or a path within the site." });
    return;
  }
  const [media] = await db
    .update(homepageMediaTable)
    .set(parsed.data)
    .where(eq(homepageMediaTable.id, params.data.mediaId))
    .returning();
  if (!media) {
    res.status(404).json({ error: "Homepage media not found" });
    return;
  }
  res.json(UpdateHomepageMediaResponse.parse(media));
});

router.delete("/homepage-media/:mediaId", async (req, res): Promise<void> => {
  const params = DeleteHomepageMediaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [media] = await db
    .delete(homepageMediaTable)
    .where(eq(homepageMediaTable.id, params.data.mediaId))
    .returning({ id: homepageMediaTable.id });
  if (!media) {
    res.status(404).json({ error: "Homepage media not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
