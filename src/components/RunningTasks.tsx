"use client";
import React from "react";
import { useRunningTasks } from "./useRunningTasks";

const RunningTasks: React.FC = () => {
  const tasks = useRunningTasks();
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md border border-gray-300">
      <h2 className="text-2xl font-bold mb-4 text-center font-bold">
        Running Tasks
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="border p-2">{task.id}</td>
              <td className="border p-2">{task.status}</td>
              <td className="border p-2">{task.updatedAt.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RunningTasks;
