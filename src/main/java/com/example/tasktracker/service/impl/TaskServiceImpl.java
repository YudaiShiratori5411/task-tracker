package com.example.tasktracker.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.tasktracker.mapper.TaskMapper;
import com.example.tasktracker.model.Status;
import com.example.tasktracker.model.Task;
import com.example.tasktracker.service.TaskService;

@Service
public class TaskServiceImpl implements TaskService {
    
    private final TaskMapper taskMapper;
    
    @Autowired
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
        // タスクのステータスが設定されていない場合、TODOをデフォルトとする
        if (task.getStatus() == null) {
            task.setStatus(Status.TODO);
        }
        
        // 同じステータスの最後の位置を取得
        List<Task> tasksInStatus = taskMapper.findByStatus(task.getStatus());
        int newPosition = tasksInStatus.size(); // 新しいタスクは最後に追加
        task.setPosition(newPosition);
        
        taskMapper.insert(task);
    }
    
    @Override
    @Transactional
    public void updateTask(Task task) {
        Task existingTask = taskMapper.findById(task.getId());
        if (existingTask != null) {
            // 位置は変更しない
            task.setPosition(existingTask.getPosition());
            taskMapper.update(task);
        }
    }
    
    @Override
    @Transactional
    public void updateTaskStatus(Long taskId, Status newStatus) {
        Task task = taskMapper.findById(taskId);
        if (task != null) {
            Status oldStatus = task.getStatus();
            
            // 古いステータスの他のタスクの位置を更新
            List<Task> tasksInOldStatus = taskMapper.findByStatus(oldStatus);
            for (Task t : tasksInOldStatus) {
                if (t.getPosition() > task.getPosition()) {
                    t.setPosition(t.getPosition() - 1);
                    taskMapper.update(t);
                }
            }
            
            // 新しいステータスの最後の位置を取得
            List<Task> tasksInNewStatus = taskMapper.findByStatus(newStatus);
            task.setPosition(tasksInNewStatus.size());
            task.setStatus(newStatus);
            
            taskMapper.update(task);
        }
    }
    
    @Override
    @Transactional
    public void deleteTask(Long id) {
        Task task = taskMapper.findById(id);
        if (task != null) {
            // 同じステータスの他のタスクの位置を更新
            List<Task> tasksInStatus = taskMapper.findByStatus(task.getStatus());
            for (Task t : tasksInStatus) {
                if (t.getPosition() > task.getPosition()) {
                    t.setPosition(t.getPosition() - 1);
                    taskMapper.update(t);
                }
            }
            taskMapper.delete(id);
        }
    }
    
    @Override
    @Transactional
    public void removeTagFromTask(Long taskId, Long tagId) {
        Task task = taskMapper.findById(taskId);
        if (task != null) {
            taskMapper.deleteTaskTag(taskId, tagId);
        }
    }

    @Override
    @Transactional
    public void addTagToTask(Long taskId, Long tagId) {
        Task task = taskMapper.findById(taskId);
        if (task != null) {
            taskMapper.insertTaskTag(taskId, tagId);
        }
    }
}