package com.example.tasktracker.service;

import java.util.List;

import com.example.tasktracker.model.Tag;

public interface TagService {
    List<Tag> getAllTags();
    Tag getTagById(Long id);
    List<Tag> getTagsByIds(Long[] ids);
    Tag createTag(Tag tag);
    void updateTag(Tag tag);
    void deleteTag(Long id);
}