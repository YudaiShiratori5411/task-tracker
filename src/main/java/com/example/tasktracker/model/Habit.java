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
    private Integer currentStreak = 0;
    private Integer bestStreak = 0;
    private LocalDateTime createdAt;
    private List<LocalDate> completedDates = new ArrayList<>();
    
    // 特定の日付が完了しているかチェック
    public boolean isCompletedOn(LocalDate date) {
        return completedDates.contains(date);
    }
    
    // 今日完了しているかチェック
    public boolean isCompletedToday() {
        return isCompletedOn(LocalDate.now());
    }
    
    // 達成率を計算（％）
    public double getCompletionRate() {
        if (completedDates.isEmpty() || targetDays == 0) {
            return 0.0;
        }
        return (completedDates.size() * 100.0) / targetDays;
    }
    
    // 目標達成までの残り日数
    public int getRemainingDays() {
        return Math.max(0, targetDays - completedDates.size());
    }
}