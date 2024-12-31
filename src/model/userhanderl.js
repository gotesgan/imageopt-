import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Function to create a user and their associated folder structure
const createUserAndFolder = async (req, res) => {
  const { name, email } = req.body;

  try {
    // Step 1: Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    // Step 2: Create the user's base folder
    const userFolderPath = path.join(
      process.cwd(),
      "public",
      "images",
      "users",
      `${user.id}`
    );

    if (!fs.existsSync(userFolderPath)) {
      fs.mkdirSync(userFolderPath, { recursive: true });
    }

    // Step 3: Return the user ID
    res.status(201).json({
      message: "User created successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error creating user and folder:", error);
    res.status(500).json({ message: "Error creating user and folder" });
  }
};

// Function to create a project and associated folders
const createProject = async (req, res) => {
  const { userId, projectName } = req.body;

  try {
    // Step 1: Create the project in the database
    const project = await prisma.project.create({
      data: {
        name: projectName,
        userId, // Link the project to the user
      },
    });

    // Step 2: Create folders for the project
    const projectFolderPath = path.join(
      process.cwd(),
      "public",
      "images",
      "users",
      `${userId}`,
      `${project.id}`
    );

    const originalFolderPath = path.join(projectFolderPath, "original");
    const transformedFolderPath = path.join(projectFolderPath, "transformed");

    // Create folders if they don't already exist
    if (!fs.existsSync(originalFolderPath)) {
      fs.mkdirSync(originalFolderPath, { recursive: true });
    }

    if (!fs.existsSync(transformedFolderPath)) {
      fs.mkdirSync(transformedFolderPath, { recursive: true });
    }

    // Step 3: Return project details
    res.status(201).json({
      message: "Project created successfully",
      projectId: project.id,
      projectName: project.name,
      userId: userId,
    });
  } catch (error) {
    console.error("Error creating project and folders:", error);
    res.status(500).json({ message: "Error creating project and folders" });
  }
};

export { createUserAndFolder, createProject };

