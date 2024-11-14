package com.example.tasktracker.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.example.tasktracker.model.Status;
import com.example.tasktracker.model.Task;

@Mapper
public interface TaskMapper {
    @Select("SELECT * FROM tasks ORDER BY status, position")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "title", column = "title"),
        @Result(property = "description", column = "description"),
        @Result(property = "deadline", column = "deadline"),
        @Result(property = "priority", column = "priority", typeHandler = com.example.tasktracker.typehandler.PriorityTypeHandler.class),
        @Result(property = "status", column = "status", typeHandler = com.example.tasktracker.typehandler.StatusTypeHandler.class),
        @Result(property = "position", column = "position"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "updatedAt", column = "updated_at")
    })
    List<Task> findAll();

    @Select("SELECT * FROM tasks WHERE id = #{id}")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "title", column = "title"),
        @Result(property = "description", column = "description"),
        @Result(property = "deadline", column = "deadline"),
        @Result(property = "priority", column = "priority", typeHandler = com.example.tasktracker.typehandler.PriorityTypeHandler.class),
        @Result(property = "status", column = "status", typeHandler = com.example.tasktracker.typehandler.StatusTypeHandler.class),
        @Result(property = "position", column = "position"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "updatedAt", column = "updated_at")
    })
    Task findById(Long id);

    @Select("SELECT * FROM tasks WHERE status = #{status} ORDER BY position")
    @Results({
        @Result(property = "id", column = "id"),
        @Result(property = "title", column = "title"),
        @Result(property = "description", column = "description"),
        @Result(property = "deadline", column = "deadline"),
        @Result(property = "priority", column = "priority", typeHandler = com.example.tasktracker.typehandler.PriorityTypeHandler.class),
        @Result(property = "status", column = "status", typeHandler = com.example.tasktracker.typehandler.StatusTypeHandler.class),
        @Result(property = "position", column = "position"),
        @Result(property = "createdAt", column = "created_at"),
        @Result(property = "updatedAt", column = "updated_at")
    })
    List<Task> findByStatus(Status status);

    @Insert("INSERT INTO tasks (title, description, deadline, priority, status, position, created_at, updated_at) " +
           "VALUES (#{title}, #{description}, #{deadline}, " +
           "#{priority, typeHandler=com.example.tasktracker.typehandler.PriorityTypeHandler}, " +
           "#{status, typeHandler=com.example.tasktracker.typehandler.StatusTypeHandler}, " +
           "#{position}, NOW(), NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Task task);

    @Update("UPDATE tasks SET " +
            "title = #{title}, " +
            "description = #{description}, " +
            "deadline = #{deadline}, " +
            "priority = #{priority, typeHandler=com.example.tasktracker.typehandler.PriorityTypeHandler}, " +
            "status = #{status, typeHandler=com.example.tasktracker.typehandler.StatusTypeHandler}, " +
            "position = #{position}, " +
            "updated_at = NOW() " +
            "WHERE id = #{id}")
    void update(Task task);

    @Delete("DELETE FROM tasks WHERE id = #{id}")
    void delete(Long id);

    @Delete("DELETE FROM task_tags WHERE task_id = #{taskId} AND tag_id = #{tagId}")
    void deleteTaskTag(@Param("taskId") Long taskId, @Param("tagId") Long tagId);

    @Insert("INSERT INTO task_tags (task_id, tag_id) VALUES (#{taskId}, #{tagId})")
    void insertTaskTag(@Param("taskId") Long taskId, @Param("tagId") Long tagId);
}