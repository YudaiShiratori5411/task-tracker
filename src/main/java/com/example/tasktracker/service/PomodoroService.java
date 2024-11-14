package com.example.tasktracker.service;

import java.util.List;
import java.util.Map;

import com.example.tasktracker.model.PomodoroSession;

public interface PomodoroService {
    PomodoroSession startSession(Long taskId);
    void completeSession(Long sessionId);
    void interruptSession(Long sessionId);
    List<PomodoroSession> getTodaysSessions(Long taskId);
    Map<String, Object> getTodaysSummary();
}