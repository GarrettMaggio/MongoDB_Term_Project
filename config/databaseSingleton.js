require('dotenv').config({path: './config/mongo.env'});
//const datacontext = require('../data/datacontext');
const {MongoClient} = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);



class DatabaseSingleton {
  static instance;
  
  static async createInstance() {
    await client.connect();
    const database = client.db('ProjectDataBase');
    DatabaseSingleton.instance = database;
    return DatabaseSingleton.instance;
  }

  static async getInstance() {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = await DatabaseSingleton.createInstance();
    }
    return DatabaseSingleton.instance;
  }

  getCollection(name) {
    if (!this.data[name]) {
      throw new Error(`Unknown collection: ${name}`);
    }
    return this.data[name];
  }
  
}

module.exports = DatabaseSingleton;
