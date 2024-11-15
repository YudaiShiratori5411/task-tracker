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
        habits.forEach(habit -> updateStreaks(habit.getId()));
        return habits;
    }
    
    @Override
    public Habit getHabitById(Long id) {
        Habit habit = habitMapper.findById(id);
        if (habit != null) {
            updateStreaks(habit.getId());
        }
        return habit;
    }
    
    @Override
    @Transactional
    public void createHabit(Habit habit) {
        habit.setCurrentStreak(0);
        habit.setBestStreak(0);
        habitMapper.insert(habit);
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
        habitMapper.insertCompletion(habitId, date);
        updateStreaks(habitId);
    }
    
    @Override
    @Transactional
    public void markIncomplete(Long habitId, LocalDate date) {
        habitMapper.deleteCompletion(habitId, date);
        updateStreaks(habitId);
    }
    
    @Override
    @Transactional
    public void updateStreaks(Long habitId) {
        Habit habit = habitMapper.findById(habitId);
        if (habit != null) {
            List<LocalDate> completions = habitMapper.findCompletionDates(habitId);
            int currentStreak = calculateCurrentStreak(completions);
            habit.setCurrentStreak(currentStreak);
            
            // BestStreakがnullの場合の処理を追加
            int bestStreak = habit.getBestStreak() != null ? habit.getBestStreak() : 0;
            if (currentStreak > bestStreak) {
                habit.setBestStreak(currentStreak);
            }
            
            habitMapper.update(habit);
        }
    }
    
    private int calculateCurrentStreak(List<LocalDate> completions) {
        if (completions == null || completions.isEmpty()) {
            return 0;
        }
        
        int streak = 1;
        LocalDate today = LocalDate.now();
        LocalDate lastDate = completions.get(completions.size() - 1);
        
        // 最後の完了日が昨日より前なら連続記録は0
        if (lastDate.isBefore(today.minusDays(1))) {
            return 0;
        }
        
        // 連続日数を計算
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