package com.example.tasktracker.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.tasktracker.mapper.TaskMapper;
import com.example.tasktracker.model.Priority;
import com.example.tasktracker.model.Status;
import com.example.tasktracker.model.Task;
import com.example.tasktracker.service.TaskService;

@Service
public class TaskServiceImpl implements TaskService {
    
    private final TaskMapper taskMapper;
    
    public TaskServiceImpl(TaskMapper taskMapper) {
        this.taskMapper = taskMapper;
    }
    
    @Override
    public List<Task> getAllTasks() {
        return taskMapper.findAll();
    }
    
    @Override
    public Task getTaskById(Long id) {
        return taskMapper.findById(id);
    }
    
    @Override
    @Transactional
    public void createTask(Task task) {
        if (task.getStatus() == null) {
            task.setStatus(Status.TODO);
        }
        List<Task> tasksInStatus = taskMapper.findByStatus(task.getStatus());
        task.setPosition(tasksInStatus.size());
        taskMapper.insert(task);
    }
    
    @Override
    @Transactional
    public void updateTask(Task task) {
        taskMapper.update(task);
    }
    
    @Override
    @Transactional
    public void updateTaskStatus(Long taskId, Status newStatus) {
        Task task = taskMapper.findById(taskId);
        if (task != null) {
            task.setStatus(newStatus);
            taskMapper.update(task);
        }
    }
    
    @Override
    @Transactional
    public Task updateTaskPriority(Long taskId, Priority newPriority) {
        Task task = taskMapper.findById(taskId);
        if (task == null) {
            throw new RuntimeException("タスクが見つかりません");
        }
        
        task.setPriority(newPriority);
        taskMapper.update(task);
        
        return task;
    }
    
    @Override
    @Transactional
    public void deleteTask(Long id) {
        taskMapper.delete(id);
    }
    
    @Override
    @Transactional
    public void addTagToTask(Long taskId, Long tagId) {
        taskMapper.insertTaskTag(taskId, tagId);
    }
    
    @Override
    @Transactional
    public void removeTagFromTask(Long taskId, Long tagId) {
        taskMapper.deleteTaskTag(taskId, tagId);
    }
}