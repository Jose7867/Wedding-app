import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { updateGuest, removeGuest } from "../controllers/guests.controller";

const router = Router();

router.put("/:id", requireAuth, updateGuest);
router.delete("/:id", requireAuth, removeGuest);

export default router;
