import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";



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

        // Step 3: Create a unique filename
        const uniqueFileName = `${Date.now()}-${image.originalname}`;
        const originalImagePath = path.join(originalFolderPath, uniqueFileName);

        // Step 4: Check if the image is oversized (e.g., over 5MB)
        const metadata = await sharp(image.path).metadata();
        const imageSizeThreshold = 5 * 1024 * 1024; // 5MB in bytes

        if (metadata.size > imageSizeThreshold) {
            // Optimize the image by resizing and compressing
            await sharp(image.path)
                .resize({ width: 1200 }) // Resize to a max width (adjust as necessary)
                .jpeg({ quality: 80 }) // Compress to JPEG with 80% quality
                .toFile(originalImagePath); // Save the optimized image
        } else {
            // Move the original image if it's not oversized
            fs.renameSync(image.path, originalImagePath);
        }

        // Step 5: Save the image reference in the database
        await prisma.Image.create({
            data: {
                fileName: uniqueFileName,
                filePath: originalImagePath,
                userId: user.id,
            },
        });

        // Step 6: Send a response with the image details
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
    const { h, w, f, q, rotate, delete: deleteParam, expire } = req.query; // Added expire query param

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
        // Handle expiration if 'expire' query parameter is passed
        if (expire) {
            const expireTime = parseInt(expire, 10);
            if (!isNaN(expireTime) && expireTime > 0) {
                const expirationDate = new Date(Date.now() - expireTime * 60 * 60 * 1000); // Expire in hours

                // Expire original image if 'o' is passed
                if (deleteParam === 'o' || deleteParam === 'both') {
                    const statsOriginal = await fs.promises.stat(originalFilePath).catch(() => null);
                    if (statsOriginal && statsOriginal.mtime < expirationDate) {
                        await fs.promises.unlink(originalFilePath);
                        return res.status(410).json({ message: "Original image has expired and has been deleted" });
                    }
                }

                // Expire transformed image if 't' is passed
                if (deleteParam === 't' || deleteParam === 'both') {
                    const statsTransformed = await fs.promises.stat(transformedPath).catch(() => null);
                    if (statsTransformed && statsTransformed.mtime < expirationDate) {
                        await fs.promises.unlink(transformedPath);
                        return res.status(410).json({ message: "Transformed image has expired and has been deleted" });
                    }
                }
            } else {
                return res.status(400).json({ message: "Invalid expire time" });
            }
        }

        // Handle deletion if 'delete' query parameter is passed
        if (deleteParam === 'original') {
            if (fs.existsSync(originalFilePath)) {
                await fs.promises.unlink(originalFilePath);
                return res.status(200).json({ message: "Original image deleted successfully" });
            } else {
                return res.status(404).json({ message: "Original image not found" });
            }
        }

        if (deleteParam === 'transformed') {
            if (fs.existsSync(transformedPath)) {
                await fs.promises.unlink(transformedPath);
                return res.status(200).json({ message: "Transformed image deleted successfully" });
            } else {
                return res.status(404).json({ message: "Transformed image not found" });
            }
        }

        // Handle transformation and serving image if 'rotate' query parameter is passed
        let image = sharp(originalFilePath);

        // If rotate is provided, apply rotation
        if (rotate) {
            const rotationAngle = parseInt(rotate, 10);
            if (!isNaN(rotationAngle)) {
                image = image.rotate(rotationAngle);
            } else {
                return res.status(400).json({ message: "Invalid rotate angle" });
            }
        }

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

        // Apply resizing, format conversion, and quality settings
        await image
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

