package com.example.tasktracker.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.One;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.example.tasktracker.model.PomodoroSession;
import com.example.tasktracker.model.Task;

@Mapper
public interface PomodoroMapper {
	
    @Select("SELECT p.*, t.title as task_title, t.description as task_description " +
            "FROM pomodoro_sessions p " +
            "JOIN tasks t ON p.task_id = t.id " +
            "WHERE DATE(p.start_time) = CURRENT_DATE " +
            "ORDER BY p.start_time DESC")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "taskId", column = "task_id"),
        @Result(property = "task", javaType = Task.class, column = "task_id",
            one = @One(select = "com.example.tasktracker.mapper.TaskMapper.findById")),
        @Result(property = "startTime", column = "start_time"),
        @Result(property = "endTime", column = "end_time"),
        @Result(property = "completed", column = "completed"),
        @Result(property = "type", column = "type")
    })
    List<PomodoroSession> findAllTodaysSessions();

    @Select("SELECT p.*, t.title as task_title, t.description as task_description " +
            "FROM pomodoro_sessions p " +
            "JOIN tasks t ON p.task_id = t.id " +
            "WHERE p.task_id = #{taskId} " +
            "AND DATE(p.start_time) = CURRENT_DATE " +
            "ORDER BY p.start_time DESC")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "taskId", column = "task_id"),
        @Result(property = "task", javaType = Task.class, column = "task_id",
            one = @One(select = "com.example.tasktracker.mapper.TaskMapper.findById")),
        @Result(property = "startTime", column = "start_time"),
        @Result(property = "endTime", column = "end_time"),
        @Result(property = "completed", column = "completed"),
        @Result(property = "type", column = "type")
    })
    List<PomodoroSession> findTodaysSessions(Long taskId);
    
    @Select("SELECT * FROM pomodoro_sessions WHERE id = #{id}")
    PomodoroSession findById(Long id);
    
    @Insert("INSERT INTO pomodoro_sessions (task_id, start_time, completed) VALUES (#{taskId}, #{startTime}, #{completed})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(PomodoroSession session);
    
    @Update("UPDATE pomodoro_sessions SET end_time = #{endTime}, completed = #{completed} WHERE id = #{id}")
    void update(PomodoroSession session);
    
//    @Select("SELECT * FROM pomodoro_sessions WHERE task_id = #{taskId} AND DATE(start_time) = CURRENT_DATE ORDER BY start_time DESC")
//    List<PomodoroSession> findTodaysSessions(Long taskId);
    
//    @Select("SELECT * FROM pomodoro_sessions WHERE DATE(start_time) = CURRENT_DATE ORDER BY start_time DESC")
//    List<PomodoroSession> findAllTodaysSessions();
    
    @Select("SELECT COUNT(*) FROM pomodoro_sessions WHERE completed = true AND DATE(start_time) = CURRENT_DATE")
    int countTodaysCompletedSessions();
    
    @Select("SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) FROM pomodoro_sessions WHERE completed = true AND DATE(start_time) = CURRENT_DATE")
    int calculateTodaysTotalFocusTime();
    
    @Select("SELECT * FROM pomodoro_sessions " +
            "WHERE task_id = #{taskId} " +
            "AND completed = false " +
            "AND end_time IS NULL " +
            "ORDER BY start_time DESC LIMIT 1")
    PomodoroSession findCurrentSession(Long taskId);
}