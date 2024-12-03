# VRV_Security
Project Overview:
This project is a simple web application that uses Role-Based Access Control (RBAC) to manage users and their access to various actions on posts. Users can have different roles, such as:

Admin: Full access to create, read, update, and delete posts.
Moderator: Can create and validate posts, but cannot delete them.
User: Can only create and read posts.
The goal of the project is to ensure that users can only perform actions based on their assigned role, making the application more secure and organized.

Technologies Used:
Node.js: JavaScript runtime for building the backend.
Express.js: Web framework for building the API.
Sequelize: Tool to interact with the database (for storing users and posts).
JWT: For secure user authentication.
bcryptjs: To securely hash user passwords.
dotenv: To store sensitive information like the JWT secret key.
RBAC Explanation:
Roles:

Admin: Can do anything (create, read, update, delete posts).
Moderator: Can create and validate posts, but cannot delete them.
User: Can only create and read posts.
Permissions are checked when users try to access specific routes:

If a user is trying to access a resource (like creating a post) that their role does not have permission for, the app denies access.
Deployment/Testing Instructions:
Set Up the Project:

Download or clone the project.
Install dependencies:
bash
Copy code
npm install
Create a .env file and set up the environment variables:
env
Copy code
JWT_SECRET_KEY=your_secret_key
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
Run the Server:

Start the server:
bash
Copy code
npm start
The server will be available at http://localhost:3000.
Testing the API:

Use a tool like Postman to test the API.

Sign Up:
POST /signup with username, password, and role (admin, moderator, or user).

Login:
POST /login with username and password to get a JWT token.

Create a Post:
POST /posts with the JWT token in the header and a JSON body containing the title and content of the post.

Get Posts:
GET /posts to see all posts.

Validate a Post (Moderator only):
POST /posts/validate/:id to validate or reject posts.

Delete a Post (Admin or Post Owner only):
DELETE /posts/:id to delete a post (only for Admin or the post owner).


