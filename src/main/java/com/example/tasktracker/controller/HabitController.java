package com.example.tasktracker.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.tasktracker.model.Habit;
import com.example.tasktracker.service.HabitService;

@Controller
@RequestMapping("/habits")
public class HabitController {
    
    @Autowired
    private HabitService habitService;
    
    // 習慣一覧表示
    @GetMapping
    public String listHabits(Model model) {
        model.addAttribute("habits", habitService.getAllHabits());
        model.addAttribute("today", LocalDate.now());
        return "habits/list";
    }
    
    // 習慣作成フォーム表示
    @GetMapping("/create")
    public String createHabitForm(Model model) {
        model.addAttribute("habit", new Habit());
        return "habits/form";
    }
    
    // 習慣作成処理
    @PostMapping
    public String createHabit(@ModelAttribute Habit habit) {
        habitService.createHabit(habit);
        return "redirect:/habits";
    }
    
    // 今日の習慣を完了としてマーク
    @PostMapping("/{id}/complete")
    @ResponseBody
    public void markHabitComplete(@PathVariable Long id) {
        habitService.markComplete(id, LocalDate.now());
    }
    
    // 習慣の削除
    @DeleteMapping("/{id}")
    public String deleteHabit(@PathVariable Long id) {
        habitService.deleteHabit(id);
        return "redirect:/habits";
    }
}
