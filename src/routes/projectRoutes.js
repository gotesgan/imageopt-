import { Router } from "express";
import { createProject } from "../model/userHandler.js";

const router = Router();

// Route to create a project for a user
router.route("/create").post(createProject);

export default router;

