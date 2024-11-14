package com.example.tasktracker.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.tasktracker.model.PomodoroSession;
import com.example.tasktracker.service.PomodoroService;
import com.example.tasktracker.service.TaskService;

@Controller
@RequestMapping("/pomodoro")
public class PomodoroController {
    
    @Autowired
    private PomodoroService pomodoroService;
    
    @Autowired
    private TaskService taskService;
    
    // ポモドーロタイマー画面表示
    @GetMapping("/{taskId}")
    public String showTimer(@PathVariable Long taskId, Model model) {
        model.addAttribute("task", taskService.getTaskById(taskId));
        model.addAttribute("sessions", pomodoroService.getTodaysSessions(taskId));
        return "pomodoro/timer";
    }
    
    // セッション開始
    @PostMapping("/{taskId}/start")
    @ResponseBody
    public PomodoroSession startSession(@PathVariable Long taskId) {
        return pomodoroService.startSession(taskId);
    }
    
    // セッション完了
    @PostMapping("/{sessionId}/complete")
    @ResponseBody
    public void completeSession(@PathVariable Long sessionId) {
        pomodoroService.completeSession(sessionId);
    }
    
    // セッション中断
    @PostMapping("/{sessionId}/interrupt")
    @ResponseBody
    public void interruptSession(@PathVariable Long sessionId) {
        pomodoroService.interruptSession(sessionId);
    }
    
    // 今日のサマリー表示
    @GetMapping("/summary")
    public String showSummary(Model model) {
        model.addAttribute("summary", pomodoroService.getTodaysSummary());
        return "pomodoro/summary";
    }
}