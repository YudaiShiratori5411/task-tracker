package com.example.tasktracker.model;

public enum Status {
    TODO("実行予定"),
    IN_PROGRESS("進行中"),
    DONE("完了");
    
    private final String displayName;
    
    Status(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}