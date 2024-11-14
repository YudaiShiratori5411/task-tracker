package com.example.tasktracker.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.tasktracker.mapper.HabitMapper;
import com.example.tasktracker.model.Habit;
import com.example.tasktracker.service.HabitService;

@Service
public class HabitServiceImpl implements HabitService {
    
    @Autowired
    private HabitMapper habitMapper;
    
    @Override
    public List<Habit> getAllHabits() {
        List<Habit> habits = habitMapper.findAll();
        for (Habit habit : habits) {
            habit.setCompletedDates(habitMapper.findCompletionDates(habit.getId()));
        }
        return habits;
    }
    
    @Override
    public Habit getHabitById(Long id) {
        Habit habit = habitMapper.findById(id);
        if (habit != null) {
            habit.setCompletedDates(habitMapper.findCompletionDates(id));
        }
        return habit;
    }
    
    @Override
    @Transactional
    public Habit createHabit(Habit habit) {
        habitMapper.insert(habit);
        return habit;
    }
    
    @Override
    @Transactional
    public void updateHabit(Habit habit) {
        habitMapper.update(habit);
    }
    
    @Override
    @Transactional
    public void deleteHabit(Long id) {
        habitMapper.delete(id);
    }
    
    @Override
    @Transactional
    public void markComplete(Long habitId, LocalDate date) {
        Habit habit = getHabitById(habitId);
        if (habit != null && !habit.isCompletedOn(date)) {
            habitMapper.insertCompletion(habitId, date);
            updateStreaks(habit);
        }
    }
    
    private void updateStreaks(Habit habit) {
        List<LocalDate> completions = habitMapper.findCompletionDates(habit.getId());
        int currentStreak = calculateCurrentStreak(completions);
        habit.setCurrentStreak(currentStreak);
        
        if (currentStreak > habit.getBestStreak()) {
            habit.setBestStreak(currentStreak);
        }
        
        habitMapper.update(habit);
    }
    
    private int calculateCurrentStreak(List<LocalDate> completions) {
        if (completions.isEmpty()) {
            return 0;
        }
        
        int streak = 1;
        LocalDate today = LocalDate.now();
        LocalDate lastDate = completions.get(completions.size() - 1);
        
        if (lastDate.isBefore(today.minusDays(1))) {
            return 0;
        }
        
        for (int i = completions.size() - 2; i >= 0; i--) {
            LocalDate currentDate = completions.get(i);
            LocalDate nextDate = completions.get(i + 1);
            
            if (currentDate.plusDays(1).equals(nextDate)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
}