const Scheduler = require('../src/Scheduler');

describe('Scheduler', () => {
  let scheduler;
  let mockClock;

  beforeEach(() => {
    mockClock = {
      now: jest.fn()
    };
    scheduler = new Scheduler(mockClock);
  });

  describe('getTasks - accesseur énumérant les tâches actuellement planifiées', () => {
    it('should return an empty array when no tasks are scheduled', () => {
      expect(scheduler.getTasks()).toEqual([]);
    });

    it('should return array with one task name after scheduling a task', () => {
      const periodicity = { shouldRun: jest.fn(() => false) };
      const mockTask = jest.fn();
      scheduler.setTask('backup', periodicity, mockTask);
      
      expect(scheduler.getTasks()).toEqual(['backup']);
    });

    it('should return array with multiple task names', () => {
      const periodicity1 = { shouldRun: jest.fn(() => false) };
      const periodicity2 = { shouldRun: jest.fn(() => false) };
      const mockTask = jest.fn();
      
      scheduler.setTask('backup', periodicity1, mockTask);
      scheduler.setTask('cleanup', periodicity2, mockTask);
      
      expect(scheduler.getTasks()).toEqual(['backup', 'cleanup']);
    });

    it('should not modify the internal task list when returned array is modified', () => {
      const periodicity = { shouldRun: jest.fn(() => false) };
      const mockTask = jest.fn();
      scheduler.setTask('backup', periodicity, mockTask);
      
      const tasks = scheduler.getTasks();
      tasks.push('malicious');
      
      expect(scheduler.getTasks()).toEqual(['backup']);
    });
  });
});