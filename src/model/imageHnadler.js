import sharp from "sharp";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Function to handle image upload and log the file name
const getImage = async (req, res) => {
	const userId = Number(req.params.id); // Ensure userId is treated as an integer
	const image = req.file;

	// Step 1: Verify if the user exists in the database
	const user = await prisma.User.findUnique({
		where: {
			id: userId, // Using the integer userId here
		},
	});

	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}

	// Step 2: Find the folder associated with the user
	const userFolderPath = path.join(
		process.cwd(),
		"public",
		"images",
		"users",
		`${user.id}` // Use user.id directly (integer type)
	);

	// Check if the folder exists, create it if it doesn't
	if (!fs.existsSync(userFolderPath)) {
		fs.mkdirSync(userFolderPath, { recursive: true });
	}

	// Step 3: Move the uploaded image to the user's folder
	const newImagePath = path.join(userFolderPath, image.filename);

	// Step 4: Rename the file to move it to the correct folder
	fs.renameSync(image.path, newImagePath);

	// Step 5: Send a response with only the image filename
	res.status(200).json({
		message: "Image uploaded successfully",
		filename: image.filename, // Only sending the filename
	});
};

const sendImage = async (req, res) => {
	const { id, fileName } = req.params; // Extract user id and fileName from URL parameters
	const { h, w, f } = req.query; // Extract height, width, and format from query parameters

	// Build the file path based on the user id and fileName
	const filePath = path.join(
		process.cwd(),
		"public",
		"images",
		"users",
		`${id}`, // Ensure id is used as an integer (it's already stringified in the path)
		fileName
	);

	// Check if the file exists
	if (!fs.existsSync(filePath)) {
		return res.status(404).json({ message: "File not found" });
	}

	// If no query parameters (h, w, f), send the original file
	if (!h && !w && !f) {
		return res.sendFile(filePath);
	}

	// Validate query parameters
	const width = w ? parseInt(w, 10) : null;
	const height = h ? parseInt(h, 10) : null;
	const format = f || path.extname(fileName).slice(1).toLowerCase(); // Default to file extension format

	try {
		// Set caching headers for performance optimization
		res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

		// Apply Sharp optimizations: resize and format conversion if applicable
		sharp(filePath)
			.resize(width, height) // Resize if width or height are provided
			.toFormat(format) // Convert to specified format or original format
			.pipe(res); // Send the optimized image directly to the client
	} catch (err) {
		console.error("Error processing image:", err);
		return res.status(500).json({ message: "Error processing image" });
	}
};

export { getImage, sendImage };
