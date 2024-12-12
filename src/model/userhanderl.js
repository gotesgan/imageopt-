import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const createUserAndFolder = async (req, res) => {
	// Extract user information from the request body
	const { name, email, project } = req.body;

	// Create an anonymous function to handle the user creation and folder creation logic
	const createUser = async () => {
		try {
			// Step 1: Create the user in the database
			const user = await prisma.User.create({
				data: {
					name,
					email,
					project,
				},
			});

			// Step 2: Create a folder for the user using the user ID
			const userFolderPath = path.join(
				process.cwd(),
				"public",
				"images",
				"users",
				`${user.id}` // Fixing the backtick and string interpolation
			);

			// Check if the folder already exists
			if (!fs.existsSync(userFolderPath)) {
				fs.mkdirSync(userFolderPath, { recursive: true }); // Create folder recursively
			}

			// Step 3: Return the user ID in the response
			res.status(201).json({
				message: "User created successfully",
				userId: user.id,
			});
		} catch (error) {
			console.error("Error creating user and folder:", error);
			res.status(500).json({ message: "Error creating user and folder" });
		}
	};

	// Execute the anonymous function
	createUser();
};

export default createUserAndFolder;
