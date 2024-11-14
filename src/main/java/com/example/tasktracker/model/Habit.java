package com.example.tasktracker.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class Habit {
    private Long id;
    private String name;
    private String description;
    private Integer targetDays;
    private Integer currentStreak;
    private Integer bestStreak;
    private LocalDateTime createdAt;
    private List<LocalDate> completedDates = new ArrayList<>();
    
    public boolean isCompletedOn(LocalDate date) {
        return completedDates.contains(date);
    }
    
    public boolean isCompletedToday() {
        return isCompletedOn(LocalDate.now());
    }
}