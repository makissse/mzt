import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import releasesRouter from "./releases";
import reviewsRouter from "./reviews";
import uploadRouter from "./upload";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(releasesRouter);
router.use(reviewsRouter);
router.use(uploadRouter);
router.use(statsRouter);

export default router;
