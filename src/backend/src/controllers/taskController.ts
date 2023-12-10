import { Task } from "@packages/types";

//Queue and tasks are not persistent, cleared on restart
const queue: Task[] = [];
const processing: Task[] = [];

function getTask(): Task | undefined {
  const task = queue.shift();
  if (!task) return;

  const processingTask = getProcessingTask(task.url);
  !processingTask && processing.push(task);

  return task;
}

function addTask(task: Task) {
  if (!queue.find((t) => t.url === task.url)) {
    queue.push(task);
  }
}

function getProcessingTask(url: string) {
  return processing.find((t) => t.url === url);
}

function setTaskSource({ url, source }) {
  const task = getProcessingTask(url);
  if (task) {
    task.source = source;
  }
}

export default {
  getTask,
  addTask,
  getProcessingTask,
  setTaskSource,
};
