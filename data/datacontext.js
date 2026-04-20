const DatabaseSingleton = require('../config/databaseSingleton');

async function getDatabase() {
    return await DatabaseSingleton.getInstance();
}   

class DataContext {

    static async ConnectUser() {
        const db = await getDatabase();
        return db.collection('Users').find({}).toArray(); 
    }

    static async CreateUser(username, password, displayName) {
        const db = await getDatabase();
        const user = {username, password, displayName};
        const result = await db.collection('Users').insertOne(user);
        console.log('Inserted user with ID:', result.insertedId);
        console.log('User data:', user);
        return {
            _id: result.insertedId,
            ...user
        };
    }

    static async FindUserById(userId) {
        const db = await getDatabase();
        return await db.collection('Users').findOne({ _id: userId });
    }

    static async GetTopics() {
        const db = await getDatabase();
        return db.collection('Topics').find({}).toArray();
    }

    static async CreateTopic(name, description) {
        const db = await getDatabase();
    }

    static async GetSubscriptions() {
        const db = await getDatabase();
        return db.collection('Subscriptions').find({}).toArray();
    }

    static async CreateSubscription(userId, topicId) {
        const db = await getDatabase();
    }

    static async FindSubscriptionsById(userId) {
        const db = await getDatabase();
        return db.collection('Subscriptions').find({userId}).toArray();
    }

    static async GetStats() {
        const db = await getDatabase();
        return db.collection('Stats').find({}).toArray();
    }
    
    static async CreateStat(type, topicId, userId) {
        const db = await getDatabase();
    }

    static async GetPosts() {
        const db = await getDatabase();
        return db.collection('Posts').find({}).toArray();
    }

    static async GetPostsByTopic(topicId, limit = 2) {
        const db = await getDatabase();
        return db.collection('Posts').find({ topicId }).sort({ createdAt: -1 }).limit(limit).toArray(); 
    }

    static async CreatePost(topicId, userId, content) {
        const db = await getDatabase();
        const post = { topicId, userId, content, createdAt: new Date().toISOString()};
        const result = await db.collection('Posts').insertOne(post);
        console.log('Inserted post with ID:', result.insertedId);
        console.log('Post data:', post);
        return {
            _id: result.insertedId,
            ...post
        }
    }

    static async GetActivityLog() {
        const db = await getDatabase();
        return db.collection('ActivityLog').find({}).toArray();
    }
    
}
module.exports = DataContext;

