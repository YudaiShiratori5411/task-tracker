package com.example.tasktracker.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class Task {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime deadline;
    private Priority priority;
    private Status status;
    private Integer position;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Tag> tags = new ArrayList<>();
}