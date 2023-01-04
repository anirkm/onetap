const { Queue, EVENTS } = require("queue-system");

const createChannelQueue = new Queue();
const deleteChannelQueue = new Queue();
const testQueue = new Queue();

function startTasks() {
  createChannelQueue.on(EVENTS.TASK_ADD, (task) => {
    console.log(`[Creation] ${task.data.user} created a onetap`);
  });
  deleteChannelQueue.on(EVENTS.TASK_ADD, (task) => {
    console.log("[Deletion] a channel has been queued for deletion");
  });

  createChannelQueue.on(EVENTS.ERROR, (task, error) => {
    console.log(`[Creation err] ${error}`);
  });
  deleteChannelQueue.on(EVENTS.TASK_ADD, (task, error) => {
    console.log(`[deletion err] ${error}`);
  });
}

const testTask = () => {
  console.log("test");
};

module.exports = {
  createChannelQueue: createChannelQueue,
  deleteChannelQueue: deleteChannelQueue,
  testQueue: testQueue,
  startTasks: startTasks,
  testTask: testTask,
};
