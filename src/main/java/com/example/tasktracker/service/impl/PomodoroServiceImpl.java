package com.example.tasktracker.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.tasktracker.mapper.PomodoroMapper;
import com.example.tasktracker.model.PomodoroSession;
import com.example.tasktracker.model.PomodoroType;
import com.example.tasktracker.service.PomodoroService;

@Service
public class PomodoroServiceImpl implements PomodoroService {
    
    @Autowired
    private PomodoroMapper pomodoroMapper;
    
    @Override
    @Transactional
    public PomodoroSession startSession(Long taskId) {
        PomodoroSession session = new PomodoroSession();
        session.setTaskId(taskId);
        session.setStartTime(LocalDateTime.now());
        session.setCompleted(false);
        session.setType(PomodoroType.WORK);
        
        pomodoroMapper.insert(session);
        return session;
    }
    
    @Override
    @Transactional
    public void completeSession(Long sessionId) {
        PomodoroSession session = pomodoroMapper.findById(sessionId);
        if (session != null) {
            session.setEndTime(LocalDateTime.now());
            session.setCompleted(true);
            pomodoroMapper.update(session);
        }
    }
    
    @Override
    @Transactional
    public void interruptSession(Long sessionId) {
        PomodoroSession session = pomodoroMapper.findById(sessionId);
        if (session != null) {
            session.setEndTime(LocalDateTime.now());
            session.setCompleted(false);
            pomodoroMapper.update(session);
        }
    }
    
    @Override
    public List<PomodoroSession> getTodaysSessions(Long taskId) {
        return pomodoroMapper.findTodaysSessions(taskId);
    }
    
    @Override
    public Map<String, Object> getTodaysSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("todaysSessions", pomodoroMapper.countTodaysCompletedSessions());
        summary.put("totalFocusTime", pomodoroMapper.calculateTodaysTotalFocusTime());
        return summary;
    }
}