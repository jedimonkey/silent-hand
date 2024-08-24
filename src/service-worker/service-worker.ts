import { registerTask } from "./lib";

registerTask("sleep", async (task) => {
  await new Promise((resolve) => {
    const duration = "duration" in task.config ? task.config.duration : 1000;
    setTimeout(() => resolve(`Paused for ${duration / 1000}s`), duration);
  });
});
