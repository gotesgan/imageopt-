import express from "express";
import dotenv from "dotenv";
import userRoute from "./routes/userRoutes.js";
import projectRoute from "./routes/projectRoutes.js"; // Import project routes

const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

// Middleware for parsing JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.use("/api/v1/user", userRoute); // User routes
app.use("/api/v1/project", projectRoute); // Project routes

// Server listen
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

