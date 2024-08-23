export type Task_Status = "executing" | "pending" | "complete" | "failed";

type Task_Types = "fetch" | (string & {});

export type TaskConfig =
  | {
      type: "fetch";
      config: {
        name: string;
        url: string;
        method?: string;
        headers?: Record<string, string>;
        body?: any;
      };
    }
  | {
      type: Task_Types;
      config: Record<string, any>;
    };

export type Task = {
  id: number;
  createdAt: Date;
  executedAt?: Date;
  updatedAt: Date;
  instanceId: string;
  status: Task_Status;
  result?: any;
  error?: string;
} & TaskConfig;

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
