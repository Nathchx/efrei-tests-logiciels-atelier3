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

  describe('setTask - définition/modification d\'une tâche planifiée', () => {
    it('should add a new task with name, periodicity and callback', () => {
      const periodicity = { shouldRun: jest.fn(() => false) };
      const callback = jest.fn();
      
      scheduler.setTask('backup', periodicity, callback);
      
      expect(scheduler.getTasks()).toContain('backup');
    });

    it('should accept a lambda/arrow function as callback', () => {
      const periodicity = { shouldRun: jest.fn(() => false) };
      
      scheduler.setTask('backup', periodicity, () => console.log('backup'));
      
      expect(scheduler.getTasks()).toContain('backup');
    });

    it('should modify an existing task when using same name', () => {
      const periodicity1 = { shouldRun: jest.fn(() => false) };
      const periodicity2 = { shouldRun: jest.fn(() => true) };
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      scheduler.setTask('backup', periodicity1, callback1);
      scheduler.setTask('backup', periodicity2, callback2);
      
      expect(scheduler.getTasks()).toEqual(['backup']);
      expect(scheduler.getTasks().length).toBe(1);
    });

    it('should store task with correct name, periodicity and callback', () => {
      const periodicity = { shouldRun: jest.fn(() => false) };
      const callback = jest.fn();
      
      scheduler.setTask('backup', periodicity, callback);
      
      const tasks = scheduler.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toBe('backup');
    });

    it('should handle multiple different tasks independently', () => {
      const periodicity1 = { shouldRun: jest.fn(() => false) };
      const periodicity2 = { shouldRun: jest.fn(() => false) };
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      scheduler.setTask('backup', periodicity1, callback1);
      scheduler.setTask('cleanup', periodicity2, callback2);
      
      const tasks = scheduler.getTasks();
      expect(tasks).toHaveLength(2);
      expect(tasks).toContain('backup');
      expect(tasks).toContain('cleanup');
    });

    it('should replace callback when modifying existing task', () => {
      const periodicity = { shouldRun: jest.fn(() => false) };
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      scheduler.setTask('backup', periodicity, callback1);
      scheduler.setTask('backup', periodicity, callback2);
      
      // Seule la deuxième tâche devrait exister
      expect(scheduler.getTasks()).toEqual(['backup']);
    });
  });

  describe('removeTask - suppression d\'une tâche planifiée par son nom', () => {
    it('should remove an existing task by name', () => {
      const periodicity = { shouldRun: jest.fn(() => false) };
      const mockTask = jest.fn();
      
      scheduler.setTask('backup', periodicity, mockTask);
      expect(scheduler.getTasks()).toContain('backup');
      
      scheduler.removeTask('backup');
      
      expect(scheduler.getTasks()).not.toContain('backup');
      expect(scheduler.getTasks()).toEqual([]);
    });

    it('should not throw error when removing non-existent task', () => {
      expect(() => {
        scheduler.removeTask('nonexistent');
      }).not.toThrow();
    });

    it('should only remove the specified task, keeping others', () => {
      const periodicity1 = { shouldRun: jest.fn(() => false) };
      const periodicity2 = { shouldRun: jest.fn(() => false) };
      const periodicity3 = { shouldRun: jest.fn(() => false) };
      const mockTask = jest.fn();
      
      scheduler.setTask('backup', periodicity1, mockTask);
      scheduler.setTask('cleanup', periodicity2, mockTask);
      scheduler.setTask('report', periodicity3, mockTask);
      
      scheduler.removeTask('cleanup');
      
      const tasks = scheduler.getTasks();
      expect(tasks).toHaveLength(2);
      expect(tasks).toContain('backup');
      expect(tasks).toContain('report');
      expect(tasks).not.toContain('cleanup');
    });

    it('should allow re-adding a task after removal', () => {
      const periodicity1 = { shouldRun: jest.fn(() => false) };
      const periodicity2 = { shouldRun: jest.fn(() => false) };
      const mockTask = jest.fn();
      
      scheduler.setTask('backup', periodicity1, mockTask);
      scheduler.removeTask('backup');
      scheduler.setTask('backup', periodicity2, mockTask);
      
      expect(scheduler.getTasks()).toContain('backup');
      expect(scheduler.getTasks()).toHaveLength(1);
    });

    it('should handle removing all tasks one by one', () => {
      const periodicity = { shouldRun: jest.fn(() => false) };
      const mockTask = jest.fn();
      
      scheduler.setTask('task1', periodicity, mockTask);
      scheduler.setTask('task2', periodicity, mockTask);
      scheduler.setTask('task3', periodicity, mockTask);
      
      scheduler.removeTask('task1');
      scheduler.removeTask('task2');
      scheduler.removeTask('task3');
      
      expect(scheduler.getTasks()).toEqual([]);
    });
  });
});