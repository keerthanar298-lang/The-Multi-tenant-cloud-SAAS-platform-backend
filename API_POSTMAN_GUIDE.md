# Superadmin Authentication API Guide (Postman)

This guide provides the details needed to test the authentication API endpoints using Postman or any other API client.

## 1. Register Superadmin

This endpoint creates a new user/superadmin, uploads their image to Cloudinary, and returns a JSON Web Token (JWT) upon success.

*   **URL:** `http://localhost:5000/api/auth/register`
*   **Method:** `POST`
*   **Body Type:** `form-data` (Because we are uploading an image)

### Form-Data Fields:
| Key | Value Type | Description / Example Value |
| :--- | :--- | :--- |
| `username` | Text | `superadmin1` |
| `email` | Text | `admin@example.com` |
| `password` | Text | `SecurePass123!` |
| `role` | Text | `superadmin` |
| `phoneNumber`| Text | `+1234567890` (Optional) |
| `address` | Text | `123 Main St, Admin City` (Optional) |
| `image` | File | Select any `.jpg`, `.jpeg`, or `.png` file from your computer. |

### Expected Success Response (201 Created):
```json
{
    "_id": "65123abc456def7890xyz123",
    "username": "superadmin1",
    "email": "admin@example.com",
    "image": "https://res.cloudinary.com/your-cloud-name/image/upload/v123456789/users/xyz123.jpg",
    "role": "superadmin",
    "status": "active",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  // <-- Your generated JWT Token
}
```

---

## 2. Login Superadmin

This endpoint authenticates an existing user and returns a JSON Web Token (JWT) upon success.

*   **URL:** `http://localhost:5000/api/auth/login`
*   **Method:** `POST`
*   **Body Type:** `raw` -> `JSON`

### JSON Body Payload:
```json
{
    "email": "admin@example.com",
    "password": "SecurePass123!"
}
```

### Expected Success Response (200 OK):
```json
{
    "_id": "65123abc456def7890xyz123",
    "username": "superadmin1",
    "email": "admin@example.com",
    "image": "https://res.cloudinary.com/your-cloud-name/image/upload/v123456789/users/xyz123.jpg",
    "role": "superadmin",
    "status": "active",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // <-- Your generated JWT Token
}
```

---

## 3. View Managers (Superadmin Only)

This endpoint retrieves a list of all users with the role of `manager`. It requires a valid superadmin bearer token in the Authorization header.

*   **URL:** `http://localhost:5000/api/users/managers`
*   **Method:** `GET`
*   **Authentication:** Bearer Token (Superadmin)

### Headers:
| Key | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <your_superadmin_token>` | Pass the JWT token received from superadmin login here. |

### Expected Success Response (200 OK):
```json
[
    {
        "_id": "65123abc456def7890xyz123",
        "username": "manager1",
        "email": "manager@example.com",
        "image": "",
        "role": "manager",
        "status": "active",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:00:00.000Z",
        "__v": 0
    }
]
```

---

## 4. View Employees (Superadmin or Manager)

This endpoint retrieves a list of all users with the role of `employee`. It can be accessed using a valid bearer token of either a **superadmin** or a **manager**.

*   **URL:** `http://localhost:5000/api/users/employees`
*   **Method:** `GET`
*   **Authentication:** Bearer Token (Superadmin or Manager)

### Headers:
| Key | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <your_token>` | Pass the JWT token received from a superadmin or manager login here. |

### Expected Success Response (200 OK):
```json
[
    {
        "_id": "65123abc456def7890xyz456",
        "username": "employee1",
        "email": "employee@example.com",
        "image": "",
        "phoneNumber": "+1234567890",
        "address": "456 Work St, City",
        "role": "employee",
        "status": "active",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:00:00.000Z",
        "__v": 0
    }
]
```

---

## 5. Update User Details by Email (Bearer Token Required)

This endpoint partially updates a single user's details **including their profile image** by their email address (used as the unique identifier). Email itself cannot be changed.

*   **URL:** `http://localhost:5000/api/users/update/:email`
*   **Method:** `PATCH`
*   **Body Type:** `form-data` (required to support image upload)
*   **Authentication:** Bearer Token (Any logged-in user)

> **Example URL:** `http://localhost:5000/api/users/update/employee@example.com`

### Headers:
| Key | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <your_token>` | Pass the JWT token received from login here. |

### Form-Data Fields (send only the fields you want to update):
| Key | Value Type | Description |
| :--- | :--- | :--- |
| `username` | Text | New username (Optional) |
| `phoneNumber` | Text | New phone number (Optional) |
| `address` | Text | New address (Optional) |
| `status` | Text | `active`, `inactive`, or `suspended` (Optional) |
| `role` | Text | `user`, `admin`, `superadmin`, `employee`, or `manager` (Optional) |
| `image` | File | New profile image `.jpg`, `.jpeg`, or `.png` — uploaded to Cloudinary (Optional) |

> **Note:** All fields are optional. `email` cannot be updated here.

### Expected Success Response (200 OK):
```json
{
    "_id": "65123abc456def7890xyz456",
    "username": "newUsername",
    "email": "employee@example.com",
    "image": "https://res.cloudinary.com/your-cloud-name/image/upload/v123/users/newimage.jpg",
    "phoneNumber": "+9876543210",
    "address": "New Address, City",
    "role": "manager",
    "status": "active",
    "updatedAt": "2023-10-28T10:00:00.000Z"
}
```

### Error Responses:
| Status | Message |
| :--- | :--- |
| `401 Unauthorized` | `Not authorized, no token` or `Not authorized, token failed` |
| `404 Not Found` | `User not found with this email` |

---

## 6. Reset User Password (Superadmin Only)

This endpoint allows a **superadmin or manager** to reset the password for any user by their email. The new password is automatically hashed before saving.

*   **URL:** `http://localhost:5000/api/auth/reset-password`
*   **Method:** `POST`
*   **Body Type:** `raw` → `JSON`
*   **Authentication:** Bearer Token (Superadmin or Manager)

### Headers:
| Key | Value | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <your_superadmin_token>` | Pass the JWT token received from superadmin login here. |
| `Content-Type` | `application/json` | Required for JSON body. |

### JSON Body:
```json
{
    "email": "employee@example.com",
    "newPassword": "NewSecurePass456!"
}
```

### Expected Success Response (200 OK):
```json
{
    "message": "Password has been reset successfully for employee@example.com"
}
```

### Error Responses:
| Status | Message |
| :--- | :--- |
| `400 Bad Request` | `Email and newPassword are required` |
| `401 Unauthorized` | `Not authorized, no token` or `Not authorized, token failed` |
| `403 Forbidden` | `Not authorized as superadmin` |
| `404 Not Found` | `User not found with this email` |

---

## 7. Register Tenant

This endpoint creates a new tenant with all personal, residential, and lease details. Files are uploaded to Cloudinary.

*   **URL:** `http://localhost:5000/api/tenants/register`
*   **Method:** `POST`
*   **Body Type:** `form-data`

### Form-Data Fields:
| Key | Value Type | Description |
| :--- | :--- | :--- |
| `fullName` | Text | **Required.** Tenant's full name |
| `gender` | Text | `male`, `female`, or `other` |
| `dateOfBirth` | Text | e.g. `1995-06-15` |
| `phoneNumber` | Text | **Required.** e.g. `+919876543210` |
| `email` | Text | **Required.** Unique email |
| `password` | Text | **Required.** Password for login |
| `aadharCardNumber` | Text | e.g. `1234-5678-9012` |
| `panCardNumber` | Text | e.g. `ABCDE1234F` |
| `permanentAddress` | Text | Full permanent address |
| `city` | Text | City name |
| `state` | Text | State name |
| `pincode` | Text | e.g. `600001` |
| `apartmentName` | Text | Name of apartment/building |
| `floorNumber` | Text | e.g. `3` |
| `flatNumber` | Text | e.g. `301` |
| `ownerName` | Text | Property owner name |
| `rentAmount` | Text | e.g. `15000` |
| `securityDeposit` | Text | e.g. `50000` |
| `leaseStartDate` | Text | e.g. `2024-01-01` |
| `leaseEndDate` | Text | e.g. `2025-01-01` |
| `numberOfMembers` | Text | e.g. `3` |
| `familyMemberNames` | Text | JSON array string: `["John","Jane"]` or comma-separated: `John,Jane` |
| `emergencyContactPerson` | Text | Name of emergency contact |
| `emergencyContactNumber` | Text | Emergency phone number |
| `vehicleType` | Text | `car`, `bike`, or `none` |
| `vehicleNumber` | Text | e.g. `TN01AB1234` |
| `parkingSlotNumber` | Text | e.g. `P-12` |
| `occupation` | Text | e.g. `Software Engineer` |
| `companyName` | Text | e.g. `TCS` |
| `status` | Text | `active` (Default) or `inactive` |
| `remarks` | Text | Any additional notes |
| `profilePhoto` | File | Profile image (jpg/png/jpeg) |
| `aadharCardPhoto` | File | Aadhar card scan (jpg/png/jpeg) |
| `panCardPhoto` | File | PAN card scan (jpg/png/jpeg) |
| `agreementUpload` | File | Lease agreement (jpg/png/jpeg/pdf) |

### Expected Success Response (201 Created):
```json
{
    "_id": "...",
    "tenantId": "TEN-000001",
    "fullName": "Rahul Kumar",
    "email": "rahul@example.com",
    "status": "active",
    "profilePhoto": "https://res.cloudinary.com/.../tenants/xyz.jpg",
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

> **Note:** `tenantId` is auto-generated (TEN-000001, TEN-000002, etc.)

---

## 8. Login Tenant

*   **URL:** `http://localhost:5000/api/tenants/login`
*   **Method:** `POST`
*   **Body Type:** `raw` → `JSON`

### JSON Body:
```json
{
    "email": "rahul@example.com",
    "password": "TenantPass123!"
}
```

### Expected Success Response (200 OK):
```json
{
    "_id": "...",
    "tenantId": "TEN-000001",
    "fullName": "Rahul Kumar",
    "email": "rahul@example.com",
    "status": "active",
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Error Responses:
| Status | Message |
| :--- | :--- |
| `401 Unauthorized` | `Invalid email or password` |
| `403 Forbidden` | `Your account is inactive. Please contact the administrator.` |

---

## 9. View All Tenants (Bearer Token Required)

Retrieves a list of all tenants (passwords excluded).

*   **URL:** `http://localhost:5000/api/tenants`
*   **Method:** `GET`
*   **Authentication:** Bearer Token

### Headers:
| Key | Value |
| :--- | :--- |
| `Authorization` | `Bearer <your_token>` |

### Expected Success Response (200 OK):
```json
[
    {
        "tenantId": "TEN-000001",
        "fullName": "Rahul Kumar",
        "email": "rahul@example.com",
        "status": "active",
        "apartmentName": "Sunrise Apartments",
        "flatNumber": "301",
        "rentAmount": 15000,
        "..."
    }
]
```

---

## 10. Update Tenant by Email (Bearer Token Required)

Partially update a tenant's details by email. Supports file re-uploads.

*   **URL:** `http://localhost:5000/api/tenants/update/:email`
*   **Method:** `PATCH`
*   **Body Type:** `form-data`
*   **Authentication:** Bearer Token

> **Example URL:** `http://localhost:5000/api/tenants/update/rahul@example.com`

### Headers:
| Key | Value |
| :--- | :--- |
| `Authorization` | `Bearer <your_token>` |

### Form-Data Fields (send only the fields you want to update):
All fields from Register (Section 7) are accepted here except `email` and `password`. File fields (`profilePhoto`, `aadharCardPhoto`, `panCardPhoto`, `agreementUpload`) can also be re-uploaded.

### Expected Success Response (200 OK):
Returns the full updated tenant object (password excluded).

### Error Responses:
| Status | Message |
| :--- | :--- |
| `401 Unauthorized` | `Not authorized, no token` |
| `404 Not Found` | `Tenant not found with this email` |

---

## 11. Update Tenant by Tenant ID (Bearer Token Required)

Partially update a tenant's details using their unique auto-generated `tenantId` (e.g., TEN-000001). Supports file re-uploads.

*   **URL:** `http://localhost:5000/api/tenants/update-by-id/:tenantId`
*   **Method:** `PATCH`
*   **Body Type:** `form-data`
*   **Authentication:** Bearer Token

> **Example URL:** `http://localhost:5000/api/tenants/update-by-id/TEN-000001`

### Headers:
| Key | Value |
| :--- | :--- |
| `Authorization` | `Bearer <your_token>` |

### Form-Data Fields (send only the fields you want to update):
All fields from Register (Section 7) are accepted here except `email`, `tenantId`, and `password`. You can pass a new `status` here to activate/deactivate the user (`active` or `inactive`). File fields (`profilePhoto`, `aadharCardPhoto`, `panCardPhoto`, `agreementUpload`) can also be re-uploaded.

### Expected Success Response (200 OK):
Returns the full updated tenant object (password excluded).

### Error Responses:
| Status | Message |
| :--- | :--- |
| `401 Unauthorized` | `Not authorized, no token` |
| `404 Not Found` | `Tenant not found with this tenant ID` |

---

## 12. Create Announcement (Superadmin or Manager Only)

*   **URL:** `http://localhost:5000/api/announcements`
*   **Method:** `POST`
*   **Authentication:** Bearer Token (Superadmin or Manager)
*   **Body Type:** `raw` -> `JSON`

### JSON Body:
```json
{
    "title": "Monthly Maintenance",
    "message": "Water supply will be interrupted on Sunday from 10 AM to 2 PM.",
    "category": "Maintenance",
    "target": "Tenants"
}
```

### Expected Success Response (201 Created):
```json
{
    "_id": "65123abc456def7890xyz789",
    "title": "Monthly Maintenance",
    "message": "Water supply will be interrupted on Sunday from 10 AM to 2 PM.",
    "category": "Maintenance",
    "target": "Tenants",
    "createdBy": "65123abc456def7890xyz123",
    "isActive": true,
    "createdAt": "2024-03-22T10:00:00.000Z",
    "updatedAt": "2024-03-22T10:00:00.000Z"
}
```

---

## 13. Get All Announcements (All Authenticated Users)

*   **URL:** `http://localhost:5000/api/announcements`
*   **Method:** `GET`
*   **Authentication:** Bearer Token (Any logged-in user)

### Expected Success Response (200 OK):
```json
[
    {
        "_id": "65123abc456def7890xyz789",
        "title": "Monthly Maintenance",
        "message": "Water supply will be interrupted on Sunday from 10 AM to 2 PM.",
        "category": "Maintenance",
        "createdBy": {
            "_id": "65123abc456def7890xyz123",
            "username": "superadmin1",
            "email": "admin@example.com"
        },
        "isActive": true,
        "createdAt": "2024-03-22T10:00:00.000Z"
    }
]
```

---

## 14. Update Announcement (Superadmin or Manager Only)

*   **URL:** `http://localhost:5000/api/announcements/:id`
*   **Method:** `PUT`
*   **Authentication:** Bearer Token (Superadmin or Manager)
*   **Body Type:** `raw` -> `JSON`

### JSON Body:
```json
{
    "title": "Updated: Monthly Maintenance",
    "isActive": true
}
```

---

## 15. Delete Announcement (Superadmin or Manager Only)

*   **URL:** `http://localhost:5000/api/announcements/:id`
*   **Method:** `DELETE`
*   **Authentication:** Bearer Token (Superadmin or Manager)

### Expected Success Response (200 OK):
```json
{
    "message": "Announcement removed"
}
```

---

---

## 16. Create Complaint (Tenant Only)

*   **URL:** `http://localhost:5000/api/complaints`
*   **Method:** `POST`
*   **Authentication:** Bearer Token (Tenant)
*   **Body Type:** `raw` -> `JSON`

### JSON Body:
```json
{
    "category": "Plumbing",
    "description": "Leaky tap in kitchen"
}
```

---

## 17. Get Complaints (Role-Based)

*   **URL:** `http://localhost:5000/api/complaints`
*   **Method:** `GET`
*   **Authentication:** Bearer Token
*   **Behavior:** 
    *   **Manager/Superadmin:** Sees ALL complaints.
    *   **Tenant:** Sees ONLY their own complaints.
    *   **Employee:** Sees ONLY complaints assigned to them.

---

## 18. Manager Respond & Assign (Manager Only)

*   **URL:** `http://localhost:5000/api/complaints/:id/respond`
*   **Method:** `PUT`
*   **Authentication:** Bearer Token (Manager/Superadmin)
*   **Body Type:** `raw` -> `JSON`

### JSON Body:
```json
{
    "managerResponse": "Plumber assigned. Will visit today by 4 PM.",
    "employeeId": "65123abc456def7890xyz456" // _id of the employee from User model
}
```

---

## 19. Employee Tracking Update (Employee Only)

*   **URL:** `http://localhost:5000/api/complaints/:id/tracking`
*   **Method:** `PUT`
*   **Authentication:** Bearer Token (Assigned Employee)
*   **Body Type:** `raw` -> `JSON`

### JSON Body (Example 1: Starting Work):
```json
{
    "status": "In Progress",
    "trackingStatus": "Reaching your flat in 10 minutes."
}
```

### JSON Body (Example 2: Finish Work):
```json
{
    "status": "Work Finished",
    "trackingStatus": "Fixed the leakage. Please verify and approve."
}
```

---

## 20. Tenant Grant Permission (Tenant Only)

*   **URL:** `http://localhost:5000/api/complaints/:id/approve`
*   **Method:** `PUT`
*   **Authentication:** Bearer Token (Tenant Owner)

> **Note:** Call this after Employee marks status as `Work Finished`.

---

## 21. Finalize Completion (Employee Only)

*   **URL:** `http://localhost:5000/api/complaints/:id/complete`
*   **Method:** `PUT`
*   **Authentication:** Bearer Token (Assigned Employee)

> **Note:** Call this after Tenant grants permission. It marks final result as `Completed`.

---

---

## 22. Create Apartment (Superadmin or Manager Only)

This endpoint creates a new apartment listing. It supports multiple image uploads, a video, and a thumbnail to Cloudinary.

*   **URL:** `http://localhost:5000/api/apartments`
*   **Method:** `POST`
*   **Authentication:** Bearer Token (Superadmin or Manager)
*   **Body Type:** `form-data`

### Form-Data Fields:
| Key | Value Type | Description |
| :--- | :--- | :--- |
| `title` | Text | **Required.** e.g. `Luxury 3BHK in Sunrise Apartments` |
| `description` | Text | **Required.** Detailed description of the apartment |
| `propertyType` | Text | Default: `Apartment` |
| `listingType` | Text | Default: `Rent` |
| `price` | Number | **Required.** Monthly rent amount |
| `advancePayment` | Number | **Required.** Advance/Deposit amount |
| `status` | Text | `Available` (Default) or `Rented` |
| `address` | Text | **Required.** Street address |
| `city` | Text | **Required.** |
| `state` | Text | **Required.** |
| `pincode` | Text | **Required.** |
| `landmark` | Text | Nearby landmark |
| `googleMap` | Text | Google Map URL |
| `bhkType` | Text | **Required.** e.g. `2BHK` |
| `area` | Number | **Required.** Area in sq.ft |
| `floorNumber` | Number | **Required.** |
| `roomNumber` | Text | **Required.** |
| `furnishingType` | Text | **Required.** `fully`, `semi`, or `unfurnished` |
| `bathroomCount` | Number | **Required.** |
| `balconiesCount` | Number | **Required.** |
| `parkingAvailability` | Text | **Required.** `Yes` or `No` |
| `amenities` | Text | JSON array `["Gym", "Pool"]` or comma-separated `Gym,Pool` |
| `images` | File (Multiple) | Upload up to 10 images |
| `video` | File (Single) | Upload 1 video (mp4/mov/avi) |
| `thumbnail` | File (Single) | Main display image |

### Expected Success Response (201 Created):
Returns the created apartment object including Cloudinary URLs.

---

## 23. Get All Apartments (Public)

*   **URL:** `http://localhost:5000/api/apartments`
*   **Method:** `GET`
*   **Authentication:** None (Public access)

---

## 24. Get Apartment by ID (Public)

*   **URL:** `http://localhost:5000/api/apartments/:id`
*   **Method:** `GET`
*   **Authentication:** None (Public access)

---

## 25. Update Apartment (Superadmin or Manager Only)

*   **URL:** `http://localhost:5000/api/apartments/:id`
*   **Method:** `PATCH`
*   **Authentication:** Bearer Token (Superadmin or Manager)
*   **Body Type:** `form-data`

---

## 26. Delete Apartment (Superadmin or Manager Only)

*   **URL:** `http://localhost:5000/api/apartments/:id`
*   **Method:** `DELETE`
*   **Authentication:** Bearer Token (Superadmin or Manager)

---

## Important Notes on JWT

*   Both the **Register** and **Login** endpoints return a `token` property in the JSON response when successful.
*   In future endpoints that require the user to be logged in, you will need to pass this `token` in the **Headers** of your Postman request like this:
    *   **Key:** `Authorization`
    *   **Value:** `Bearer eyJhbGciOiJIUzI1NiIsIn...` (Replace with your actual token)
