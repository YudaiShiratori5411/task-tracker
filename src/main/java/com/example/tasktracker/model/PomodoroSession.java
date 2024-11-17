package com.example.tasktracker.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PomodoroSession {
    private Long id;
    private Task task;
    private Long taskId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean completed;
    private PomodoroType type;
}