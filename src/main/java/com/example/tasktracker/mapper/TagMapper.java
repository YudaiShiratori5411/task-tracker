package com.example.tasktracker.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.example.tasktracker.model.Tag;

@Mapper
public interface TagMapper {
    @Select("SELECT * FROM tags ORDER BY name")
    List<Tag> findAll();
    
    @Select("SELECT * FROM tags WHERE id = #{id}")
    Tag findById(Long id);
    
    @Select("SELECT t.* FROM tags t " +
            "JOIN task_tags tt ON t.id = tt.tag_id " +
            "WHERE tt.task_id = #{taskId}")
    List<Tag> findByTaskId(Long taskId);
    
    @Insert("INSERT INTO tags (name, color, created_at) " +
            "VALUES (#{name}, #{color}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Tag tag);
    
    @Update("UPDATE tags SET name = #{name}, color = #{color} WHERE id = #{id}")
    void update(Tag tag);
    
    @Delete("DELETE FROM tags WHERE id = #{id}")
    void delete(Long id);
    
    @Delete("DELETE FROM task_tags WHERE tag_id = #{tagId}")
    void deleteTagFromAllTasks(Long tagId);
    
    @Insert("INSERT INTO task_tags (task_id, tag_id) VALUES (#{taskId}, #{tagId})")
    void addTagToTask(@Param("taskId") Long taskId, @Param("tagId") Long tagId);
    
    @Delete("DELETE FROM task_tags WHERE task_id = #{taskId} AND tag_id = #{tagId}")
    void removeTagFromTask(@Param("taskId") Long taskId, @Param("tagId") Long tagId);
}