package com.example.tasktracker.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.tasktracker.model.Priority;
import com.example.tasktracker.model.Status;
import com.example.tasktracker.model.Task;
import com.example.tasktracker.service.TaskService;

@Controller
@RequestMapping("/tasks")
public class TaskController {
    
    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);
    
    @Autowired
    private TaskService taskService;
    
    // タスク一覧表示
    @GetMapping
    public String listTasks(Model model) {
        try {
            List<Task> tasks = taskService.getAllTasks();
            logger.info("Retrieved {} tasks", tasks.size());
            for (Task task : tasks) {
                logger.debug("Task: id={}, title={}, status={}", 
                    task.getId(), task.getTitle(), 
                    task.getStatus() != null ? task.getStatus().name() : "null");
            }
            model.addAttribute("tasks", tasks);
            return "tasks/list";
        } catch (Exception e) {
            logger.error("Error retrieving tasks", e);
            model.addAttribute("errorMessage", "タスクの取得中にエラーが発生しました");
            return "tasks/list";
        }
    }
    
    // タスク作成フォーム表示
    @GetMapping("/create")
    public String createTaskForm(Model model) {
        model.addAttribute("task", new Task());
        model.addAttribute("statuses", Status.values());
        model.addAttribute("priorities", Priority.values());
        return "tasks/form";
    }
    
    // タスク作成処理
    @PostMapping
    public String createTask(@ModelAttribute Task task) {
        try {
            logger.info("Creating new task: {}", task);
            taskService.createTask(task);
            return "redirect:/tasks";
        } catch (Exception e) {
            logger.error("Error creating task", e);
            throw e;
        }
    }
    
    @GetMapping("/edit/{id}")
    public String editTaskForm(@PathVariable Long id, Model model) {
        try {
            Task task = taskService.getTaskById(id);
            if (task == null) {
                return "redirect:/tasks";
            }
            model.addAttribute("task", task);
            model.addAttribute("statuses", Status.values());
            model.addAttribute("priorities", Priority.values());
            return "tasks/form";
        } catch (Exception e) {
            logger.error("タスクの編集中にエラーが発生しました: {}", e.getMessage());
            return "redirect:/tasks";
        }
    }

    @PostMapping("/edit/{id}")
    public String updateTask(@PathVariable Long id, @ModelAttribute Task task, RedirectAttributes redirectAttributes) {
        try {
            task.setId(id);
            taskService.updateTask(task);
            redirectAttributes.addFlashAttribute("message", "タスクを更新しました");
            redirectAttributes.addFlashAttribute("messageType", "success");
            return "redirect:/tasks";
        } catch (Exception e) {
            logger.error("タスクの更新中にエラーが発生しました: {}", e.getMessage());
            redirectAttributes.addFlashAttribute("message", "タスクの更新に失敗しました");
            redirectAttributes.addFlashAttribute("messageType", "danger");
            return "redirect:/tasks";
        }
    }
    
    // タスクステータス更新（Ajax用）
    @PostMapping("/{id}/status")
    @ResponseBody
    public void updateTaskStatus(@PathVariable Long id, @RequestParam Status status) {
        try {
            logger.info("Updating task status: id={}, status={}", id, status);
            taskService.updateTaskStatus(id, status);
        } catch (Exception e) {
            logger.error("Error updating task status", e);
            throw e;
        }
    }
    
    // タスク削除処理
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("タスクの削除中にエラーが発生しました: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}