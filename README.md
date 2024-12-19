# Image Handler System Documentation

## Architecture Overview

This system follows the Model-View-Controller (MVC) architectural pattern for handling image uploads and user management. The application is built using Node.js with Prisma as the ORM.

### Model Layer

The data models are defined using Prisma schema:

#### User Model
```prisma
model User {
  id        String      @id @default(uuid())
  name      String
  email     String
  project   String
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  images    Image[]
}
```

#### Image Model
```prisma
model Image {
  id        String      @id @default(uuid())
  fileName  String
  filePath  String
  userId    String
  createdAt DateTime    @default(now())
  user      User        @relation(fields: [userId], references: [id])
}
```

### Controller Layer

The system implements two main controllers:

#### 1. User Controller (`userController.js`)

Handles user-related operations including:
- Creating new users
- Setting up user-specific image directories
- Managing user metadata

Key Functions:
- `createUserAndFolder`: Creates a new user and initializes their image storage directory

#### 2. Image Controller (`imageHandler.js`)

Manages image-related operations including:
- Image upload handling
- Image transformation
- Image serving

Key Functions:
- `getImage`: Handles image upload and storage
- `sendImage`: Processes and serves images with transformation options

### Directory Structure

```
project-root/
├── public/
│   └── images/
│       └── users/
│           └── [userId]/
│               ├── original/
│               └── transformed/
```

## Technical Implementation Details

### Image Upload Process

1. **User Verification**
   - Verifies user existence in database
   - Checks user permissions

2. **File Storage**
   - Creates user-specific directories if they don't exist
   - Generates unique filenames using timestamps
   - Stores original images in the user's directory

3. **Database Recording**
   - Records image metadata in the database
   - Links images to specific users

### Image Transformation Features

The system supports the following image transformations:
- Resize (width/height)
- Format conversion
- Quality adjustment

Query Parameters:
- `w`: Width in pixels
- `h`: Height in pixels
- `f`: Output format
- `q`: Quality level

### Error Handling

The system implements comprehensive error handling for:
- User not found scenarios
- File system operations
- Image processing failures
- Database operations

## API Endpoints

### User Management
```
POST /api/users
Body: {
  name: string,
  email: string,
  project: string
}
```

### Image Operations
```
POST /api/images/:id
- Uploads an image for a specific user

GET /api/images/:id/:fileName
Query params:
- h: height
- w: width
- f: format
- q: quality
```

## Security Considerations

1. User Authentication
   - Each request is associated with a specific user ID
   - Verifies user existence before operations

2. File System Security
   - Implements user-specific directories
   - Validates file types and sizes
   - Uses unique filenames to prevent conflicts

3. Resource Management
   - Caches transformed images
   - Implements directory structure for organized storage

## Best Practices Implemented

1. **Separation of Concerns**
   - Clear separation between models, controllers, and file handling
   - Modular code structure for maintainability

2. **Efficient Resource Usage**
   - Caches transformed images
   - Implements lazy transformation

3. **Error Handling**
   - Comprehensive error catching and reporting
   - Appropriate HTTP status codes
   - Detailed error messages for debugging

4. **Scalability Considerations**
   - User-specific directory structure
   - Efficient image transformation caching
   - Asynchronous operations

## Dependencies

- `sharp`: Image processing
- `prisma`: Database ORM
- `fs`: File system operations
- `path`: Path management

## Future Improvements

1. Implement image validation and sanitization
2. Add support for batch operations
3. Implement image optimization strategies
4. Add support for more image formats
5. Implement image metadata extraction