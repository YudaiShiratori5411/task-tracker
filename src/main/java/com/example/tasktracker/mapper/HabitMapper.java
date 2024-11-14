package com.example.tasktracker.mapper;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.example.tasktracker.model.Habit;

@Mapper
public interface HabitMapper {
    @Select("SELECT * FROM habits")
    List<Habit> findAll();
    
    @Select("SELECT * FROM habits WHERE id = #{id}")
    Habit findById(Long id);
    
    @Insert("INSERT INTO habits (name, description, target_days, created_at) " +
            "VALUES (#{name}, #{description}, #{targetDays}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Habit habit);
    
    @Update("UPDATE habits SET " +
            "name = #{name}, description = #{description}, " +
            "target_days = #{targetDays}, current_streak = #{currentStreak}, " +
            "best_streak = #{bestStreak} WHERE id = #{id}")
    void update(Habit habit);
    
    @Delete("DELETE FROM habits WHERE id = #{id}")
    void delete(Long id);
    
    @Insert("INSERT INTO habit_completions (habit_id, completion_date) " +
            "VALUES (#{habitId}, #{date})")
    void insertCompletion(@Param("habitId") Long habitId, @Param("date") LocalDate date);
    
    @Select("SELECT completion_date FROM habit_completions " +
            "WHERE habit_id = #{habitId} ORDER BY completion_date")
    List<LocalDate> findCompletionDates(Long habitId);
}