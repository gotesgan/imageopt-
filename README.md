
### **1. Overview**
This project is designed to handle user registration, project creation, and image management using Prisma as the ORM for database interactions, Express.js for the web server, and Sharp for image transformation. The application manages users, their associated projects, and image uploads, storing both original and transformed images in a structured folder system.

---

### **2. Key Features**
1. **User Creation**: Create a user and set up a folder structure for storing images.
2. **Project Creation**: Allow users to create projects, which also create associated folders for storing images related to each project.
3. **Image Upload & Transformation**: Users can upload images, which are stored in specific project folders. The images can also be transformed (resized, formatted) before being served.
4. **Image Retrieval**: Retrieve either original or transformed images with dynamic parameters (like width, height, format, and quality).

---

### **3. Technologies Used**
- **Backend**: 
  - Express.js
  - Prisma ORM
  - Multer for handling file uploads
  - Sharp for image transformations
- **Database**: PostgreSQL (via Prisma Client)
- **File Storage**: Local disk storage
- **File Format**: JPEG, PNG, and other formats supported by Sharp

---

### **4. Project Structure**
```bash
/
├── public/
│   └── images/
│       └── users/
│           └── <user_id>/
│               └── <project_id>/
│                   └── original/
│                   └── transformed/
├── src/
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   └── imageRoutes.js
│   ├── model/
│   │   ├── userHandler.js
│   │   └── imageHandler.js
│   ├── server.js
│   └── utils/
│       └── multer.js
├── .env
├── prisma/
│   └── schema.prisma
└── package.json
```

---

### **5. API Endpoints**

#### 5.1. **Create User**
- **Endpoint**: `POST /api/v1/user/create`
- **Description**: Creates a new user and sets up a folder for storing project-related images.
- **Request Parameter**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User created successfully",
    "userId": "<user_id>"
  }
  ```

#### 5.2. **Create Project**
- **Endpoint**: `POST /api/v1/project/create`
- **Description**: Creates a new project for a user and sets up the corresponding project folders.
- **Request Body**:
  ```json
  {
    "userId": "<user_id>",
    "projectName": "Project X"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Project created successfully",
    "projectId": "<project_id>",
    "projectName": "Project X",
    "userId": "<user_id>"
  }
  ```

#### 5.3. **Upload Image**
- **Endpoint**: `POST /api/v1/image/upload/:userId/:projectName`
- **Description**: Uploads an image for a specific project. The image is saved in the "original" folder of the project.
- **Request**: Form-data (multipart) with a file field named `file`.
- **Response**:
  ```json
  {
    "message": "Image uploaded successfully",
    "filename": "<unique_file_name>"
  }
  ```

#### 5.4. **Download Image**
- **Endpoint**: `GET /api/v1/image/download/:userId/:projectName/:fileName`
- **Description**: Downloads a transformed image (if applicable) or the original image, applying any requested transformations (resize, format change, quality adjustments).
- **Query Parameters**:
  - `w`: Width of the image
  - `h`: Height of the image
  - `f`: Format (e.g., "jpeg", "png")
  - `q`: Quality (1-100)
- **Response**: Image file (downloadable).

---

### **6. Detailed Flow**

#### 6.1. **User Creation Flow**
1. A `POST` request is sent to `/api/v1/user/create` with user details (name and email).
2. The server creates a user entry in the database via Prisma.
3. A folder is created on the server under `public/images/users/<user_id>`, where all the user's project-related images will be stored.
4. The user is returned with a success message and their unique user ID.

#### 6.2. **Project Creation Flow**
1. A `POST` request is sent to `/api/v1/project/create` with the user ID and project name.
2. The server creates a project entry in the database.
3. Folders are created for the project under `public/images/users/<user_id>/<project_id>/original` and `transformed`.
4. The project is returned with a success message and project details.

#### 6.3. **Image Upload Flow**
1. A `POST` request is sent to `/api/v1/image/upload/:userId/:projectName`, with the image as a file (using form-data).
2. The server checks if the user exists in the database.
3. The image is saved in the `original` folder of the project.
4. The file is renamed to avoid conflicts and to ensure uniqueness.
5. The image metadata (file name and path) is stored in the database.

#### 6.4. **Image Download and Transformation Flow**
1. A `GET` request is sent to `/api/v1/image/download/:userId/:projectName/:fileName`, with query parameters for transformations (width, height, format, quality).
2. The server checks if the original image exists.
3. If the image needs to be transformed, the Sharp library processes the image based on the query parameters.
4. The transformed image is saved in the `transformed` folder.
5. The image is served to the client for download.

---

### **7. Database Schema (Prisma)**

#### 7.1. **User Model**
```prisma
model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  projects  Project[]
}
```
- **id**: Unique identifier for the user.
- **name**: User's name.
- **email**: Unique email address of the user.
- **projects**: Relation to the Project model.

#### 7.2. **Project Model**
```prisma
model Project {
  id        String   @id @default(uuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
- **id**: Unique identifier for the project.
- **name**: Project name.
- **userId**: Foreign key to the User model.
- **user**: Relation to the User model.

#### 7.3. **Image Model**
```prisma
model Image {
  id        String    @id @default(uuid())
  fileName  String
  filePath  String
  userId    String
  createdAt DateTime @default(now())
  user      User      @relation(fields: [userId], references: [id])
}
```
- **id**: Unique identifier for the image.
- **fileName**: The name of the image file.
- **filePath**: The path where the image is stored.
- **userId**: Foreign key to the User model.
- **user**: Relation to the User model.

---

### **8. Environment Variables**

Ensure that the `.env` file contains the following environment variables:

```
DATABASE_URL=your_database_url
PORT=3000
```

---

### **9. Conclusion**

This documentation provides a detailed overview of the user, project, and image management system built using Express.js, Prisma, and Sharp. The flow ensures that images are uploaded, stored, and transformed according to user specifications. By utilizing Prisma for database interactions and implementing a file system for image storage, the application offers an efficient solution for managing user data, projects, and images in a structured manner.

--- 

T
