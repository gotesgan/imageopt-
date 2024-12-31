import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();

// Function to handle image upload and log the file name
const getImage = async (req, res) => {
    const { userId, projectName } = req.params;
    const image = req.file;

    try {
        // Step 1: Verify if the user exists in the database
        const user = await prisma.User.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Step 2: Define the user project folder structure
        const projectFolderPath = path.join(
            process.cwd(),
            "public",
            "images",
            "users",
            user.id,
            projectName
        );
        const originalFolderPath = path.join(projectFolderPath, "original");

        // Ensure the folders exist
        if (!fs.existsSync(originalFolderPath)) {
            fs.mkdirSync(originalFolderPath, { recursive: true });
        }

        // Step 3: Create a unique filename and move the uploaded image
        const uniqueFileName = `${Date.now()}-${image.originalname}`;
        const newImagePath = path.join(originalFolderPath, uniqueFileName);

        fs.renameSync(image.path, newImagePath);

        // Step 4: Save the image reference in the database
        await prisma.Image.create({
            data: {
                fileName: uniqueFileName,
                filePath: newImagePath,
                userId: user.id,
            },
        });

        // Step 5: Send a response with the image details
        res.status(200).json({
            message: "Image uploaded successfully",
            filename: uniqueFileName,
        });
    } catch (error) {
        console.error("Error processing image:", error);
        return res.status(500).json({ message: "Error uploading image" });
    }
};

// Function to handle image retrieval and transformation
const sendImage = async (req, res) => {
    const { userId, projectName, fileName } = req.params;
    const { h, w, f, q } = req.query;

    const originalFilePath = path.join(
        process.cwd(),
        "public",
        "images",
        "users",
        userId,
        projectName,
        "original",
        fileName
    );

    // Parse transformation parameters
    const width = w ? parseInt(w, 10) : null;
    const height = h ? parseInt(h, 10) : null;
    const format = f || path.extname(fileName).slice(1).toLowerCase();
    const quality = q ? parseInt(q, 10) : null;

    const transformedFileName = `${path.basename(
        fileName,
        path.extname(fileName)
    )}_${w || "auto"}x${h || "auto"}_${f || "original"}_q${q || "default"}.${
        format
    }`;

    const transformedPath = path.join(
        process.cwd(),
        "public",
        "images",
        "users",
        userId,
        projectName,
        "transformed",
        transformedFileName
    );

    try {
        // Check if the transformed image already exists
        if (await fs.promises.stat(transformedPath).catch(() => false)) {
            return res.sendFile(transformedPath);
        }

        // Check if the original image exists
        if (!fs.existsSync(originalFilePath)) {
            return res.status(404).json({ message: "Original image not found" });
        }

        // Ensure the transformed directory exists
        const transformedDir = path.dirname(transformedPath);
        await fs.promises.mkdir(transformedDir, { recursive: true });

        // Process and save the transformed image
        await sharp(originalFilePath)
            .resize(width, height)
            .toFormat(format, { quality })
            .toFile(transformedPath);

        // Serve the transformed image
        res.sendFile(transformedPath);
    } catch (err) {
        console.error("Error processing image:", err);
        return res.status(500).json({ message: "Error processing image" });
    }
};

export { getImage, sendImage };

