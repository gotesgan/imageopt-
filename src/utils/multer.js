import multer from "multer";


const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// Ensure the directory path is correct
		cb(null, ".../../public/images");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // Unique identifier
		const ext = file.originalname.split(".").pop(); // Extract file extension
		cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`); // Unique name with extension
	},
});

const upload = multer({ storage: storage });

// Export the upload middleware
export { upload };