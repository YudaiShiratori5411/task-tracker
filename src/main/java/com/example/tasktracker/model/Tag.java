package com.example.tasktracker.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Tag {
    private Long id;
    private String name;
    private String color;
    private LocalDateTime createdAt;
}