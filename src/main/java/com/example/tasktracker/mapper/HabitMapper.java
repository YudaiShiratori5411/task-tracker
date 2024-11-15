package com.example.tasktracker.mapper;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Many;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.example.tasktracker.model.Habit;

@Mapper
public interface HabitMapper {
    @Select("SELECT * FROM habits ORDER BY created_at DESC")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "completedDates", column = "id",
                many = @Many(select = "findCompletionDates"))
    })
    List<Habit> findAll();
    
    @Select("SELECT * FROM habits WHERE id = #{id}")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "completedDates", column = "id",
                many = @Many(select = "findCompletionDates"))
    })
    Habit findById(Long id);
    
    @Select("SELECT completion_date FROM habit_completions " +
            "WHERE habit_id = #{habitId} ORDER BY completion_date")
    List<LocalDate> findCompletionDates(Long habitId);
    
    @Insert("INSERT INTO habits (name, description, target_days, current_streak, " +
            "best_streak, created_at) VALUES (#{name}, #{description}, " +
            "#{targetDays}, #{currentStreak}, #{bestStreak}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Habit habit);
    
    @Update("UPDATE habits SET name = #{name}, description = #{description}, " +
            "target_days = #{targetDays}, current_streak = #{currentStreak}, " +
            "best_streak = #{bestStreak} WHERE id = #{id}")
    void update(Habit habit);
    
    @Delete("DELETE FROM habits WHERE id = #{id}")
    void delete(Long id);
    
    @Insert("INSERT INTO habit_completions (habit_id, completion_date) " +
            "VALUES (#{habitId}, #{date})")
    void insertCompletion(@Param("habitId") Long habitId, @Param("date") LocalDate date);
    
    @Delete("DELETE FROM habit_completions WHERE habit_id = #{habitId} " +
            "AND completion_date = #{date}")
    void deleteCompletion(@Param("habitId") Long habitId, @Param("date") LocalDate date);
}