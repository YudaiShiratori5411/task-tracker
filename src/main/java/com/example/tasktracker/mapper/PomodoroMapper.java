package com.example.tasktracker.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.example.tasktracker.model.PomodoroSession;

@Mapper
public interface PomodoroMapper {
    @Select("SELECT * FROM pomodoro_sessions WHERE id = #{id}")
    PomodoroSession findById(Long id);
    
    @Insert("INSERT INTO pomodoro_sessions (task_id, start_time, completed, type) " +
            "VALUES (#{taskId}, #{startTime}, #{completed}, #{type})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(PomodoroSession session);
    
    @Update("UPDATE pomodoro_sessions SET " +
            "end_time = #{endTime}, completed = #{completed} " +
            "WHERE id = #{id}")
    void update(PomodoroSession session);
    
    @Select("SELECT * FROM pomodoro_sessions " +
            "WHERE task_id = #{taskId} " +
            "AND DATE(start_time) = CURRENT_DATE")
    List<PomodoroSession> findTodaysSessions(Long taskId);
    
    @Select("SELECT COUNT(*) FROM pomodoro_sessions " +
            "WHERE completed = true " +
            "AND DATE(start_time) = CURRENT_DATE")
    int countTodaysCompletedSessions();
    
    @Select("SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) " +
            "FROM pomodoro_sessions " +
            "WHERE completed = true " +
            "AND DATE(start_time) = CURRENT_DATE")
    int calculateTodaysTotalFocusTime();
}