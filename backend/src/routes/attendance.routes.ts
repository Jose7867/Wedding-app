import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  markGuestPresent,
  markAllPresent,
  listAttendance,
} from "../controllers/attendance.controller";

const router = Router();

router.get("/", requireAuth, listAttendance);
router.post("/invitation/:invitationId/all", requireAuth, markAllPresent);
router.post("/:guestId", requireAuth, markGuestPresent);

export default router;
