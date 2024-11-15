package com.example.tasktracker.service;

import java.util.List;

import com.example.tasktracker.model.Priority;
import com.example.tasktracker.model.Status;
import com.example.tasktracker.model.Task;

public interface TaskService {
    List<Task> getAllTasks();
    Task getTaskById(Long id);
    void createTask(Task task);
    void updateTask(Task task);
    void updateTaskStatus(Long taskId, Status newStatus);
    Task updateTaskPriority(Long taskId, Priority newPriority);  // 追加
    void deleteTask(Long id);
    void addTagToTask(Long taskId, Long tagId);
    void removeTagFromTask(Long taskId, Long tagId);
}
