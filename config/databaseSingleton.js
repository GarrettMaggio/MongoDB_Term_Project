const path = require('path');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.resolve(__dirname, '../.env') });



class DatabaseSingleton {
  static instance;
  static client;
  
  static async createInstance() {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined. Ensure .env is configured.');
    }

    if (!DatabaseSingleton.client) {
      DatabaseSingleton.client = new MongoClient(process.env.MONGO_URI);
    }

    await DatabaseSingleton.client.connect();
    const database = DatabaseSingleton.client.db('ProjectDataBase');
    DatabaseSingleton.instance = database;
    return DatabaseSingleton.instance;
  }

  static async getInstance() {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = await DatabaseSingleton.createInstance();
    }
    return DatabaseSingleton.instance;
  }
  
}

module.exports = DatabaseSingleton;
