const mockData = require('../data/mockData');

class DatabaseSingleton {
  static instance;

  constructor() {
    this.mode = 'mock';
    this.data = JSON.parse(JSON.stringify(mockData));
  }

  static getInstance() {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new DatabaseSingleton();
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
