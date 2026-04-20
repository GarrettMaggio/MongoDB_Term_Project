const DataContext = require('../data/datacontext');

class ActivityModel {

    async logActivity(type, topicId, userId) {
    
    }

    async getActivityLog() {
        const activityLog = await DataContext.GetActivityLog();
        return activityLog.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

}
module.exports = new ActivityModel();