"use client";
import React from "react";
import { useRunningTasks } from "../hooks/useRunningTasks";

const RunningTasks: React.FC = () => {
  const tasks = useRunningTasks();
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md border border-gray-300 dark:border-gray-600">
      <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">
        Running Tasks
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border p-2 dark:text-white">ID</th>
            <th className="border p-2 dark:text-white">Status</th>
            <th className="border p-2 dark:text-white">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="bg-white dark:bg-gray-900">
              <td className="border p-2 dark:text-white">{task.id}</td>
              <td className="border p-2 dark:text-white">{task.status}</td>
              <td className="border p-2 dark:text-white">
                {task.updatedAt.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RunningTasks;
