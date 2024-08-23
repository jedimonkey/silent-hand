export type Task_Status = "executing" | "pending" | "complete" | "failed";

export interface TaskConfig {
  name: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface Task extends TaskConfig {
  id: number;
  createdAt: Date;
  executedAt?: Date;
  updatedAt: Date;
  instanceId: string;
  status: Task_Status;
  result?: any;
  error?: string;
}

export interface ExtendableMessageData {
  action: "enqueue";
  task: TaskConfig;
}

export interface ExtendableMessageEvent extends MessageEvent {
  data: ExtendableMessageData;
}

export interface TaskUpdateMessageData {
  type: "TASK_UPDATE";
  task: Task;
}
