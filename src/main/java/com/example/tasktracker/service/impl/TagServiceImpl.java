package com.example.tasktracker.service.impl;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.tasktracker.mapper.TagMapper;
import com.example.tasktracker.model.Tag;
import com.example.tasktracker.service.TagService;

@Service
public class TagServiceImpl implements TagService {
    
    @Autowired
    private TagMapper tagMapper;
    
    @Override
    public List<Tag> getAllTags() {
        return tagMapper.findAll();
    }
    
    @Override
    public Tag getTagById(Long id) {
        return tagMapper.findById(id);
    }
    
    @Override
    public List<Tag> getTagsByIds(Long[] ids) {
        if (ids == null || ids.length == 0) {
            return List.of();
        }
        return Arrays.stream(ids)
                    .map(this::getTagById)
                    .filter(tag -> tag != null)
                    .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public Tag createTag(Tag tag) {
        if (tag.getColor() == null || tag.getColor().isEmpty()) {
            tag.setColor("#6c757d");
        }
        tagMapper.insert(tag);
        return tag;
    }
    
    @Override
    @Transactional
    public void updateTag(Tag tag) {
        tagMapper.update(tag);
    }
    
    @Override
    @Transactional
    public void deleteTag(Long id) {
        tagMapper.deleteTagFromAllTasks(id);
        tagMapper.delete(id);
    }
}