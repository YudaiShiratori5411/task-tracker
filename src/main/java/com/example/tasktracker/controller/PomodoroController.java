package com.example.tasktracker.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.tasktracker.model.PomodoroSession;
import com.example.tasktracker.model.Task;
import com.example.tasktracker.service.PomodoroService;
import com.example.tasktracker.service.TaskService;

@Controller
@RequestMapping("/pomodoro")
public class PomodoroController {
    
	private static final Logger logger = LoggerFactory.getLogger(PomodoroController.class);
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private PomodoroService pomodoroService;

    // サマリーページのエンドポイントを先に定義
    @GetMapping("/summary")
    public String showSummary(Model model) {
        try {
            logger.info("Showing pomodoro summary");
            List<PomodoroSession> todaysSessions = pomodoroService.getTodaysSessions();
            
            Map<String, Object> stats = new HashMap<>();
            int completedSessions = pomodoroService.countTodaysCompletedSessions();
            int totalTime = pomodoroService.getTodaysTotalFocusTime();
            
            stats.put("totalSessions", completedSessions);
            stats.put("totalTime", totalTime);
            stats.put("averageSessionTime", completedSessions > 0 ? (double)totalTime / completedSessions : 0.0);

            model.addAttribute("todaysSessions", todaysSessions);
            model.addAttribute("stats", stats);

            return "pomodoro/summary";
        } catch (Exception e) {
            logger.error("Error showing summary", e);
            return "redirect:/tasks";
        }
    }

    // タスク別のタイマー表示
    @GetMapping("/task/{taskId}")  // パスを変更
    public String showTimer(@PathVariable Long taskId, Model model) {
        try {
            logger.info("Requesting timer for task ID: {}", taskId);
            
            Task task = taskService.getTaskById(taskId);
            if (task == null) {
                logger.warn("Task not found for ID: {}", taskId);
                return "redirect:/tasks";
            }
            
            PomodoroSession pomodoroSession = pomodoroService.getCurrentSession(taskId);
            
            model.addAttribute("task", task);
            model.addAttribute("pomodoroSession", pomodoroSession);
            model.addAttribute("pomodoroHistory", pomodoroService.getTodaysSessions(taskId));
            model.addAttribute("totalFocusTime", pomodoroService.getTodaysTotalFocusTime());
            
            return "pomodoro/timer";
        } catch (Exception e) {
            logger.error("Error showing timer for task ID: " + taskId, e);
            return "redirect:/tasks";
        }
    }

    @PostMapping("/task/{taskId}/start")
    @ResponseBody
    public PomodoroSession startSession(@PathVariable Long taskId) {
        return pomodoroService.startSession(taskId);
    }
    
    @PostMapping("/task/{sessionId}/complete")
    @ResponseBody
    public void completeSession(@PathVariable Long sessionId) {
        pomodoroService.completeSession(sessionId);
    }
    
    @GetMapping("/task/{taskId}/sessions")
    @ResponseBody
    public List<PomodoroSession> getTaskSessions(@PathVariable Long taskId) {
        return pomodoroService.getTodaysSessions(taskId);
    }
    
    @GetMapping("/stats")
    @ResponseBody
    public Map<String, Object> calculateAverageSessionTime() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("completedSessions", pomodoroService.countTodaysCompletedSessions());
        stats.put("totalFocusTime", pomodoroService.getTodaysTotalFocusTime());
        
        return stats;
    }
    
}




