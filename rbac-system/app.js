const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { User, Post } = require('./db'); // Assuming these are Sequelize models

// Initialize environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Define roles and their permissions
const roles = {
  admin: ["read", "write", "delete"],
  user: ["read"],
  moderator: ["read", "write"],
};

// Middleware to authenticate requests
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from "Authorization" header

  if (!token) {
    // No token provided, return a 401 Unauthorized status with a WWW-Authenticate header
    return res.status(401).set('WWW-Authenticate', 'Bearer realm="example", error="missing_token", error_description="No token provided"').json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      // Invalid token, return a 401 Unauthorized status with a WWW-Authenticate header
      return res.status(401).set('WWW-Authenticate', 'Bearer realm="example", error="invalid_token", error_description="Invalid or expired token"').json({
        error: 'Unauthorized',
        message: 'Token is invalid or expired'
      });
    }

    req.user = user;
    next();
  });
};


// Middleware for role-based access control (RBAC)
function authorize(roles) {
  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send("No token provided");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;

      if (!roles.includes(decoded.role)) {
        return res.status(403).send("Access denied");
      }

      next();
    } catch (error) {
      return res.status(401).send("Invalid token");
    }
  };
}

// Sign-up function
async function signUp(req, res) {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    if (!["admin", "user", "moderator"].includes(role)) {
      return res.status(400).send("Invalid role");
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await User.create({ username, password: hashedPassword, role });
    return res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).send("Internal server error");
  }
}

// Login function
async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).send("User not found");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).send("Invalid password");

    const payload = { username: user.username, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    return res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("Internal server error");
  }
}

// Create Post
app.post("/posts",authenticateToken ,authorize(["user", "moderator", "admin"]), async (req, res) => {
  const { title, content } = req.body;

  try {
    if (!title || title.length < 5) return res.status(400).send("Title must be at least 5 characters long");
    if (!content || content.length < 20) return res.status(400).send("Content must be at least 20 characters long");

    await Post.create({ username: req.user.username, title, content, isValidated: false });
    return res.status(201).send("Post created successfully, waiting for validation");
  } catch (error) {
    return res.status(500).send("Error creating post");
  }
});

// Get all Posts
app.get("/posts",authenticateToken, authorize(["user", "moderator", "admin"]), async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (error) {
    res.status(500).send("Error fetching posts");
  }
});

// Get Unvalidated Posts (Admin only)
app.get("/posts/unvalidated",authenticateToken, authorize(["admin"]), async (req, res) => {
  try {
    const posts = await Post.findAll({ where: { isValidated: false } });
    res.json(posts);
  } catch (error) {
    res.status(500).send("Error fetching unvalidated posts");
  }
});

// Moderator validates the post (only moderators can validate)
app.post("/posts/validate/:id", authenticateToken,authorize(["moderator"]), async (req, res) => {
  const postId = req.params.id;
  const { isValid, comments } = req.body;

  try {
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).send("Post not found");

    post.isValidated = isValid;
    await post.save();

    res.send(isValid ? "Post validated successfully" : `Post rejected: ${comments || 'No comments provided'}`);
  } catch (error) {
    res.status(500).send("Error validating post");
  }
});

// Delete Post (Admin or Owner)
app.delete("/posts/:id",authenticateToken, authorize(["admin", "moderator"]), async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).send("Post not found");

    if (post.username !== req.user.username && req.user.role !== "admin") {
      return res.status(403).send("You do not have permission to delete this post");
    }

    await post.destroy();
    res.send("Post deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting post");
  }
});

// Routes for Sign-Up and Login
app.post("/signup", signUp);
app.post("/login", login);

// Server setup
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
