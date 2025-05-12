const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

// MongoDB connection string - update with your actual connection string
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/exercise_library";

async function updateCredentials() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db();
    const users = db.collection('users');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('Bibliothek', 10);
    
    // Check if user exists
    const existingUser = await users.findOne({ username: 'Kraftwerk' });
    
    if (existingUser) {
      // Update existing user
      await users.updateOne(
        { username: 'Kraftwerk' },
        { $set: { password: hashedPassword } }
      );
      console.log('User credentials updated successfully');
    } else {
      // Create new user
      await users.insertOne({
        username: 'Kraftwerk',
        password: hashedPassword,
        createdAt: new Date()
      });
      console.log('New user created successfully');
    }
  } catch (error) {
    console.error('Error updating MongoDB:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

updateCredentials();
