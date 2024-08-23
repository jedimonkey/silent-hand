"use client";
import React from "react";
import { useCompletedTasks } from "./useCompletedTasks";

const CompletedTasks: React.FC = () => {
  const { totalTasks, tasks } = useCompletedTasks(5);
  return (
    <div className="p-4 bg-gray-100 rounded-xl shadow-md border border-gray-300">
      <h2 className="text-2xl font-bold mb-4 text-center font-bold">
        Completed Tasks (Total {totalTasks})
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Time Taken</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="border p-2">{task.id}</td>
              <td className="border p-2">{task.status}</td>
              <td className="border p-2">
                {(
                  (new Date(task.updatedAt).getTime() -
                    new Date(task.createdAt).getTime()) /
                  1000
                ).toFixed(2)}
                s
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedTasks;
