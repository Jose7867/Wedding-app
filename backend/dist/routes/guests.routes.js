"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const guests_controller_1 = require("../controllers/guests.controller");
const router = (0, express_1.Router)();
router.put("/:id", auth_1.requireAuth, guests_controller_1.updateGuest);
router.delete("/:id", auth_1.requireAuth, guests_controller_1.removeGuest);
exports.default = router;
