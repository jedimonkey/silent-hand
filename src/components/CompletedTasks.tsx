"use client";
import React from "react";
import { useCompletedTasks } from "../hooks/useCompletedTasks";

const CompletedTasks: React.FC = () => {
  const { totalTasks, tasks } = useCompletedTasks(5);
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md border border-gray-300">
      <h2 className="text-2xl mb-4 text-center font-bold dark:text-white">
        Completed Tasks (Total {totalTasks})
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="border p-2 dark:text-white">ID</th>
            <th className="border p-2 dark:text-white">Type</th>
            <th className="border p-2 dark:text-white">Status</th>
            <th className="border p-2 dark:text-white">Time</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="dark:bg-gray-800">
              <td className="border p-2 dark:text-white">{task.id}</td>
              <td className="border p-2 dark:text-white">{task.type}</td>
              <td className="border p-2 dark:text-white">{task.status}</td>
              <td className="border p-2 dark:text-white">
                {task.status === "failed" ? (
                  <>
                    <div>
                      Queued: {new Date(task.createdAt).toLocaleString()}
                    </div>
                    <div>
                      Failed: {new Date(task.updatedAt).toLocaleString()}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      Total:{" "}
                      {(
                        (new Date(task.updatedAt).getTime() -
                          new Date(task.createdAt).getTime()) /
                        1000
                      ).toFixed(2)}
                      s
                    </div>
                    <div>
                      Execution:{" "}
                      {task.executedAt
                        ? (
                            (new Date(task.updatedAt).getTime() -
                              new Date(task.executedAt).getTime()) /
                            1000
                          ).toFixed(2)
                        : "N/A"}
                      s
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompletedTasks;
