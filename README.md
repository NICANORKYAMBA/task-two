# User Authentication & Organisation Management API

## Overview

This project is a Node.js application built with Express.js and Prisma ORM. It handles user authentication and organisation management, connecting to a PostgreSQL database. Features include user registration, login, and managing organisations.

## Features

- **User Authentication**: Register and log in users securely.
- **Organisation Management**: Users can create, join, and manage organisations.
- **JWT Authentication**: Secure endpoints with JSON Web Tokens.

## Prerequisites

- Node.js
- Express.js
- PostgreSQL
- Prisma CLI

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/NICANORKYAMBA/task-two
    cd task-two
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Environment Variables:**

    Create a `.env` file in the root directory and add the following:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/database"
    JWT_SECRET="your_jwt_secret"
    PORT=3000
    ```

4. **Database Setup:**

    Run Prisma migrations to set up the database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

## Running the Application

Start the server:

```bash
npm start
```

## API Endpoints

### Authentication

- **Register User**

    `POST /auth/register`

    ```json
    {
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "password": "string",
        "phone": "string"
    }
    ```

    **Response:**

    ```json
    {
        "status": "success",
        "message": "Registration successful",
        "data": {
            "userId": "string",
            "firstName": "string",
            "lastName": "string",
            "email": "string",
            "phone": "string"
        }
    }
    ```

- **Login User**

    `POST /auth/login`

    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```

    **Response:**

    ```json
    {
        "status": "success",
        "message": "Login successful",
        "data": {
            "token": "string",
            "user": {
                "userId": "string",
                "firstName": "string",
                "lastName": "string",
                "email": "string",
                "phone": "string"
            }
        }
    }
    ```

### Users

- **Get User Details**

    `GET /api/users/:id`

    **Response:**

    ```json
    {
        "status": "success",
        "message": "User retrieved successfully",
        "data": {
            "userId": "string",
            "firstName": "string",
            "lastName": "string",
            "email": "string",
            "phone": "string"
        }
    }
    ```

### Organisations

- **Get All Organisations**

    `GET /api/organisations`

    **Response:**

    ```json
    {
        "status": "success",
        "message": "Organisations retrieved successfully",
        "data": [
            {
                "orgId": "string",
                "name": "string",
                "description": "string"
            }
        ]
    }
    ```

- **Get Organisation Details**

    `GET /api/organisations/:orgId`

    **Response:**

    ```json
    {
        "status": "success",
        "message": "Organisation retrieved successfully",
        "data": {
            "orgId": "string",
            "name": "string",
            "description": "string"
        }
    }
    ```

- **Create Organisation**

    `POST /api/organisations`

    ```json
    {
        "name": "string",
        "description": "string"
    }
    ```

    **Response:**

    ```json
    {
        "status": "success",
        "message": "Organisation created successfully",
        "data": {
            "orgId": "string",
            "name": "string",
            "description": "string"
        }
    }
    ```

- **Add User to Organisation**

    `POST /api/organisations/:orgId/users`

    ```json
    {
        "userId": "string"
    }
    ```

    **Response:**

    ```json
    {
        "status": "success",
        "message": "User added to organisation successfully"
    }
    ```
- **Tests**
Run `npm test` command to run Jest tests

## License

This project is licensed under the MIT License.