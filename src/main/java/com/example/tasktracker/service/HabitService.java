package com.example.tasktracker.service;

import java.time.LocalDate;
import java.util.List;

import com.example.tasktracker.model.Habit;

public interface HabitService {
    List<Habit> getAllHabits();
    Habit getHabitById(Long id);
    void createHabit(Habit habit);
    void updateHabit(Habit habit);
    void deleteHabit(Long id);
    void markComplete(Long habitId, LocalDate date);
    void markIncomplete(Long habitId, LocalDate date);
    void updateStreaks(Long habitId);
}