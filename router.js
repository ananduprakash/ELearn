import { Router } from "express";
import {
  courseStudents,
  createCourse,
  schedule,
} from "./controllers/courseController.js";
import {
  registerUser,
  loginUser,
  getMe,
  createRole,
  usersRoles,
} from "./controllers/userController.js";
import { pass } from "./middlewares/strategy.js";

export const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", pass.authenticate("jwt", { session: false }), getMe);
router.post("/role", pass.authenticate("jwt", { session: false }), createRole);
router.post(
  "/userroles",
  pass.authenticate("jwt", { session: false }),
  usersRoles
);
router.post(
  "/course",
  pass.authenticate("jwt", { session: false }),
  createCourse
);
router.post(
  "/coursestudents",
  pass.authenticate("jwt", { session: false }),
  courseStudents
);
router.post(
  "/schedule",
  pass.authenticate("jwt", { session: false }),
  schedule
);
