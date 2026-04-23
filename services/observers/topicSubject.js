class TopicSubject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    this.observers.push(observer);
  }

  async notify(eventName, payload) {
    for (const observer of this.observers) {
      await observer.update(eventName, payload);
    }
  }
}

module.exports = new TopicSubject();
