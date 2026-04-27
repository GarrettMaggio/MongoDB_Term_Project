const { MongoClient, ObjectId } = require('mongodb');

let client = null;
let db = null;

async function getDatabase() {
  if (db) return db;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. MongoDB-backed DataContext requires a valid connection string.');
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db('ProjectDataBase');
  return db;
}

class DataContext {
    static extractIdCandidate(value) {
        if (value == null) return null;
        if (value instanceof ObjectId) return value;
        if (typeof value === 'string') return value.trim();
        if (typeof value === 'object') {
            if (value._id != null) return this.extractIdCandidate(value._id);
            if (value.id != null) return this.extractIdCandidate(value.id);
            if (value.userId != null) return this.extractIdCandidate(value.userId);
            if (value.topicId != null) return this.extractIdCandidate(value.topicId);
            if (value.postId != null) return this.extractIdCandidate(value.postId);
            if (value.subscriptionId != null) return this.extractIdCandidate(value.subscriptionId);
            if (typeof value.toHexString === 'function') return value.toHexString();
            if (typeof value.toString === 'function') return value.toString();
        }
        return null;
    }

    static isValidObjectIdString(value) {
        return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
    }

    static normalizeObjectId(value) {
        const candidate = this.extractIdCandidate(value);
        if (candidate == null) return null;
        if (candidate instanceof ObjectId) return candidate;
        if (!this.isValidObjectIdString(candidate)) return null;
        return new ObjectId(candidate);
    }

    static async toObjectId(id) {
        return this.normalizeObjectId(id);
    }

    static async CreateUser(username, password, displayName) {
        const db = await getDatabase();
        const user = {username, password, displayName};
        const result = await db.collection('Users').insertOne(user);
        return {
            _id: result.insertedId,
            ...user
        };
    }

    static async CreateTopic(topic) {
        const db = await getDatabase();
        const result = await db.collection('Topics').insertOne(topic);
        return {
            _id: result.insertedId,
            ...topic
        };
    }

    static async CreateSubscription(userId, topicId) {
        const db = await getDatabase();
        const normalizedUserId = this.normalizeObjectId(userId);
        const normalizedTopicId = this.normalizeObjectId(topicId);
        if (!normalizedUserId || !normalizedTopicId) return null;
        const topic = await db.collection('Topics').findOne({ _id: normalizedTopicId });
        if (!topic) return null;

        const existingSubscription = await db.collection('Subscriptions').findOne({ userId: normalizedUserId , topicId: normalizedTopicId });        
        if (existingSubscription) {
            return existingSubscription;
        }

        const subscription = {name: topic.name, description: topic.description, tags: topic.tags, accessCount: topic.accessCount, userId: normalizedUserId, topicId: normalizedTopicId, createdAt: new Date().toISOString()};

        const result = await db.collection('Subscriptions').insertOne(subscription);
        return {
            _id: result.insertedId,
            ...subscription
        };
    }

    static async CreateStat(type, topicId, userId) {
        const db = await getDatabase();
        const normalizedTopicId = this.normalizeObjectId(topicId);
        const normalizedUserId = this.normalizeObjectId(userId);
        const topic = normalizedTopicId ? await db.collection('Topics').findOne({ _id: normalizedTopicId }) : null;
        if (!topic) return null;
        const stat = { 
            type, name: topic.name, description: topic.description, tags: topic.tags, accessCount: topic.accessCount, topicId: normalizedTopicId, userId: normalizedUserId, createdAt: new Date().toISOString()
        };
        const result = await db.collection('Stats').insertOne(stat);
        return {
            _id: result.insertedId,
            ...stat
        }
    }

    static async CreatePost(topicId, userId, content) {
        const db = await getDatabase();
        const post = {
            topicId: this.normalizeObjectId(topicId),
            userId: this.normalizeObjectId(userId),
            content,
            createdAt: new Date()
        };
        const result = await db.collection('Posts').insertOne(post);
        return {
            _id: result.insertedId,
            ...post
        }
    }

    static async CreateActivityLog(userId, action, topicId) {
        const db = await getDatabase();
        const logEntry = { userId: this.normalizeObjectId(userId), action, topicId: this.normalizeObjectId(topicId), createdAt: new Date().toISOString() };
        const result = await db.collection('ActivityLog').insertOne(logEntry);
        return {
            _id: result.insertedId,
            ...logEntry
        }
    }

    static async ConnectUser() {
        const db = await getDatabase();
        return db.collection('Users').find({}).toArray(); 
    }

    static async FindUserById(userId) {
        const db = await getDatabase();
        const normalizedId = this.normalizeObjectId(userId);
        if (!normalizedId) return null;
        return await db.collection('Users').findOne({ _id: normalizedId });
    }

  static async GetTopics() {
    const db = await getDatabase();
    const topics = await db.collection('Topics').find({}).toArray();

    return topics.map((topic) => ({
      ...topic,
      id: topic.id || topic._id?.toString(),
      name: topic.name || topic.title || '',
      description: topic.description || topic.summary || '',
      tags: Array.isArray(topic.tags) ? topic.tags : [],
      accessCount: topic.accessCount ?? topic.visits ?? 0,
      createdBy: topic.createdBy || null
    }));
  }

    static async FindTopicsById(topicId) {
        const db = await getDatabase();
        const normalizedTopicId = this.normalizeObjectId(topicId);
        if (!normalizedTopicId) return [];
        return db.collection('Topics').find({ _id: normalizedTopicId }).toArray();
    }

    static async IncrementTopicAccess(topicId) {
        const db = await getDatabase();
        const normalizedTopicId = this.normalizeObjectId(topicId);
        if (!normalizedTopicId) return null;
        return db.collection('Topics').updateOne(
            { _id: normalizedTopicId },
            { $inc: { accessCount: 1 } }
        );
    }

    static async GetSubscriptions() {
        const db = await getDatabase();
        const subscribedTopics = await db.collection('Subscriptions').find({}).toArray();
        return subscribedTopics.map(t => ({
            ...t,
            id: t._id.toString(),
        }));
    }

    static async FindSubscriptionsById(userId, topicId) {
        const db = await getDatabase();
        const normalizedUserId = this.normalizeObjectId(userId);
        if (!normalizedUserId) return [];
        const query = { userId: normalizedUserId };
        if (topicId) {
            const normalizedTopicId = this.normalizeObjectId(topicId);
            if (!normalizedTopicId) return [];
            query.topicId = normalizedTopicId;
        }
        const userSubs = await db.collection('Subscriptions').find(query).toArray();
        return userSubs;
    }

    static async GetSubscriptionsByUserId(userId) {
        const db = await getDatabase();
        const normalizedUserId = this.normalizeObjectId(userId);
        if (!normalizedUserId) return [];
        const rows = await db.collection('Subscriptions').find({ userId: normalizedUserId }).toArray();
        return rows.map((row) => ({
            ...row,
            id: row._id?.toString(),
            topicId: row.topicId?.toString(),
            userId: row.userId?.toString()
        }));
    }

    static async DeleteSubscription(userId, topicId) {
        const db =  await getDatabase();
        const UID = this.normalizeObjectId(userId);
        const TID = this.normalizeObjectId(topicId);
        if (!UID || !TID) return null;

        const subscription = await db.collection('Subscriptions').findOne({userId: UID, topicId: TID});
        if (!subscription) {
            return null;
        }

        return await db.collection('Subscriptions').deleteOne({ _id: subscription._id  });
    }

    static async GetAccessCounts() {
    const db = await getDatabase();
    const result = await db.collection('Topics').aggregate([
        {
            $group: {
                _id: null, // Group everything into one bucket
                total: { $sum: "$accessCount" } // Sum the accessCount field
            }
        }
    ]).toArray();

    return result[0]?.total || 0; // Return the total or 0 if no topics exist
}

    static async GetStats() {
        const db = await getDatabase();
        return await db.collection('Stats').find({}).toArray();
    }

    static async IncrementTopicPostStats(topicId, createdAt = new Date().toISOString()) {
        const db = await getDatabase();
        const normalizedTopicId = this.normalizeObjectId(topicId);
        if (!normalizedTopicId) return null;
        const topic = await db.collection('Topics').findOne({ _id: normalizedTopicId });
        if (!topic) return null;

        return await db.collection('Stats').updateOne(
            { type: 'topic-posts', topicId: normalizedTopicId },
            {
                $set: {
                    type: 'topic-posts',
                    topicId: normalizedTopicId,
                    name: topic.name,
                    description: topic.description,
                    tags: topic.tags || [],
                    lastPostAt: createdAt
                },
                $inc: { numPosts: 1 }
            },
            { upsert: true }
        );
    }

    static async UpdateStats(userId, topicId) {
        const db = await getDatabase();
        const normalizedUserId = this.normalizeObjectId(userId);
        const normalizedTopicId = this.normalizeObjectId(topicId);
        if (!normalizedUserId || !normalizedTopicId) return null;
        const topic = await db.collection('Topics').findOne({ _id: normalizedTopicId });
        if (!topic) {
            return null;
        }
        else {
            const filter = { userId: normalizedUserId, topicId: normalizedTopicId };
            const update = { $set: { name: topic.name, description: topic.description, tags: topic.tags, accessCount: topic.accessCount, createdAt: new Date().toISOString() } };
            const options = { upsert: true };
            return await db.collection('Stats').updateOne(filter, update, options);
        }
    }

    static async DeleteStat(type, topicId, userId) {
        const db = await getDatabase();
        return await db.collection('Stats').deleteOne({ type, topicId: this.normalizeObjectId(topicId), userId: this.normalizeObjectId(userId) });
    }

    static async GetStatsUser(userId) {
        const db = await getDatabase();
        const normalizedUserId = this.normalizeObjectId(userId);
        if (!normalizedUserId) return null;
        return await db.collection('UserStats').findOne({ userId: normalizedUserId });
    }

    static async UpdateStatsUser(userId, stats) {
        const db = await getDatabase();
        return await db.collection('UserStats').updateOne({ userId: this.normalizeObjectId(userId) }, { $set: stats }, { upsert: true });
    }

    static async GetPosts() {
        const db = await getDatabase();
        return db.collection('Posts').find({}).toArray();
    }

    static async GetPostsByTopic(topicIds, limit = 2) {
        const db = await getDatabase();
        if (!Array.isArray(topicIds) || !topicIds.length) {
            return [];
        }

        const ids = topicIds.map((id) => this.normalizeObjectId(id)).filter(Boolean);
        if (!ids.length) return [];

        const results = await Promise.all(
            ids.map(async (topicId) => {
                const posts = await db.collection('Posts')
                    .find({ topicId })
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .toArray();

                return {
                    topicId,
                    posts
                };
            })
        );
        return results;
    }

    static async DeletePost(postId) {
        const db = await getDatabase();
        const normalizedPostId = this.normalizeObjectId(postId);
        if (!normalizedPostId) return null;
        return await db.collection('Posts').deleteOne({ _id: normalizedPostId });
    }


    static async GetActivityLog() {
        const db = await getDatabase();
        return db.collection('ActivityLog').find({}).toArray();
    }

    
}
module.exports = DataContext;
