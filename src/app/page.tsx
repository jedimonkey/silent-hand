import CompletedTasks from "@/components/CompletedTasks";
import { QueueLogger } from "@/components/QueueLogger";
import { QueueTask } from "@/components/QueueTask";
import RunningTasks from "@/components/RunningTasks";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-12 lg:p-24">
      <div className="z-10 w-full flex-col max-w-5xl justify-between font-mono text-sm flex gap-y-4">
        <div>
          <QueueTask />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RunningTasks />
          <CompletedTasks />
        </div>
        <div className=" border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  rounded-xl lg:border lg:bg-gray-200 p-4 lg:dark:bg-zinc-800/30">
          <p className="flex w-full text-left">
            <code className="font-mono font-bold">Log:</code>
          </p>
          <QueueLogger />
        </div>
      </div>
    </main>
  );
}
