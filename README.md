# Image Upload and Retrieval System

## Overview
This code handles the uploading, saving, and retrieval of user images, as well as the creation of user-specific folders to store these images. It uses the **Prisma ORM** for database interactions and **Sharp** for image processing.

---

## 1. getImage Function (Image Upload)
This function handles the upload of images for users.

- **Path**: `GET /upload/:id`
- **Parameters**:
  - `id` (URL parameter): User ID for whom the image is uploaded.
  - `file` (Multipart form-data): The image file being uploaded.

### **Steps**:
1. **User Validation**: It checks if the user exists in the database by their `id`.
2. **Folder Creation**: Creates a folder for the user in `public/images/users/` if it doesn't already exist.
3. **Image Upload**: The uploaded image is moved to the user's folder.
4. **Response**: Sends back a success message with the filename of the uploaded image.

---

## 2. sendImage Function (Image Retrieval)
This function is responsible for retrieving images based on the user ID and filename, with optional image optimizations.

- **Path**: `GET /image/:id/:fileName`
- **Parameters**:
  - `id` (URL parameter): User ID from which the image is to be fetched.
  - `fileName` (URL parameter): The name of the image file.
  - `h` (Query parameter, optional): The height to which the image should be resized.
  - `w` (Query parameter, optional): The width to which the image should be resized.
  - `f` (Query parameter, optional): The format to which the image should be converted (e.g., JPEG, PNG).

### **Steps**:
1. **File Path Construction**: It builds the path to the user's image folder.
2. **File Existence Check**: If the file doesn't exist, it returns a "File not found" error.
3. **Image Optimizations**: If the query parameters `h`, `w`, or `f` are provided, it resizes and/or converts the image using **Sharp**.
4. **Image Delivery**: Sends the image back to the client, either in its original or optimized form.

---

## 3. createUserAndFolder Function (User Creation with Folder)
This function creates a new user in the database and generates a folder for them to store images.

- **Path**: `POST /user`
- **Parameters**:
  - `name` (Request body): The user's name.
  - `email` (Request body): The user's email.
  - `project` (Request body): The project associated with the user.

### **Steps**:
1. **User Creation**: It adds a new user to the database using **Prisma**.
2. **Folder Creation**: Creates a folder for the user in `public/images/users/` using their `id` for the folder name.
3. **Response**: Returns a success message with the new user's `id`.

---

## Additional Notes:
- **Folder Path**: All user images are stored in `public/images/users/` under a folder named after the user's `id`.
- **Sharp**: The **Sharp** library is used to handle image resizing and format conversion.
- **Prisma Client**: This is used to interact with the database for user creation and validation.

---

## Error Handling:
- If the user is not found during image upload or retrieval, it returns a `404` status with a corresponding error message.
- If there's any issue with database interaction or folder creation, it returns a `500` status with an error message.
