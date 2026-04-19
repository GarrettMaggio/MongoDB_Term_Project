const DatabaseSingleton = require('../config/databaseSingleton');


async function getDatabase() {
    return await DatabaseSingleton.getInstance();
}

class DataContext {
    static async ConnectUser() {
        const db = await getDatabase();
        return db.collection('Users').find({}).toArray(); 
    }
    static async GetTopics() {
        const db = await getDatabase();
        return db.collection('Topics').find({}).toArray();
    }
    static async GetSubscriptions() {
        const db = await getDatabase();
        return db.collection('Subscriptions').find({}).toArray();
    }
    static async GetStats() {
        const db = await getDatabase();
        return db.collection('Stats').find({}).toArray();
    }
    
}
module.exports = DataContext;
