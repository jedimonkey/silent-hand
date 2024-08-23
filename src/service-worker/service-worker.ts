import { registerTask } from "./lib";

registerTask("sleep", async (task) => {
  await new Promise((resolve) =>
    setTimeout(() => resolve("Paused for 1s"), 1000)
  );
});
