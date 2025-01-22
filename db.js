const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    logging: false,
    host: process.env.DB_HOST || 'localhost', 
    dialect: 'mysql', 
    port: process.env.DB_PORT || 3306, 
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
  timestamps: false 
});

const Post = sequelize.define("Post", {
 
  username: {
    type: Sequelize.STRING,
    allowNull: false,  
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
      // timestamps: false 
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
