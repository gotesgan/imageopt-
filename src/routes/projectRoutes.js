import { Router } from "express";
import { createProject } from "../model/userhanderl.js";

const router = Router();

// Route to create a project for a user
router.route("/create/:userId/:projectName").post(createProject);

export default router;

