package com.example.tasktracker.model;

public enum PomodoroType {
    WORK("作業"),
    SHORT_BREAK("小休憩"),
    LONG_BREAK("長休憩");
    
    private final String displayName;
    
    PomodoroType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}