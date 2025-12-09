class Scheduler {
  constructor(clock) {
    this.clock = clock;
    this.tasks = new Map();
  }

  getTasks() {
    return Array.from(this.tasks.keys());
  }

  setTask(name, periodicity, callback) {
    this.tasks.set(name, {
      periodicity,
      callback,
      lastRun: null
    });
  }

  removeTask(name) {
    this.tasks.delete(name);
  }

  update() {
    const now = this.clock.now();
    for (const [name, task] of this.tasks.entries()) {
      if (task.periodicity.shouldRun(task.lastRun, now)) {
        task.callback();
        task.lastRun = now;
      }
    }
  }
}

module.exports = Scheduler;