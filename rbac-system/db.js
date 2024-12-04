const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // Database username
  process.env.DB_PASSWORD, // Database password
  {
    logging: false,
    host: process.env.DB_HOST || 'localhost', // Database host
    dialect: 'mysql', // Database dialect (mysql)
    port: process.env.DB_PORT || 3306, // Database port (default to 3306 for MySQL)
  }
);

// Test the database connection
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['admin', 'user', 'moderator']],
    }
  }
}, {
  timestamps: false // Add timestamps option here
});

// Define the Post model
// const Post = sequelize.define('Post', {
//   title: { 
//     type: DataTypes.STRING,
//     allowNull: false, 
//   },
//   content: { 
//     type: DataTypes.TEXT,
//     allowNull: false, 
//   },
//   isValidated: { 
//     type: DataTypes.BOOLEAN, 
//     defaultValue: false,
//   },
// }, {
//   timestamps: false // Add timestamps option here
// });

const Post = sequelize.define("Post", {
 
  username: {
    type: Sequelize.STRING,
    allowNull: false,  // Ensure this field is not nullable
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  isValidated: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  
      timestamps: false // Add timestamps option here
    });
  

// Establish relationships (better to use `id` as foreign key)
User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

// Sync models with the database
async function syncModels() {
  try {
    await sequelize.sync();
    console.log('Models synchronized with the database');
  } catch (err) {
    console.error('Error synchronizing models:', err);
  }
}

syncModels();

// Export models for use in other parts of the app
module.exports = { sequelize, User, Post };
