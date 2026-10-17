import { Router, type IRouter } from "express";
import attendanceRouter from "./attendance";
import eventsRouter from "./events";
import feesRouter from "./fees";
import healthRouter from "./health";
import homepageMediaRouter from "./homepage-media";
import schoolRouter from "./school";
import studentsRouter from "./students";
import teachersRouter from "./teachers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(schoolRouter);
router.use(studentsRouter);
router.use(teachersRouter);
router.use(attendanceRouter);
router.use(feesRouter);
router.use(eventsRouter);
router.use(homepageMediaRouter);

export default router;
