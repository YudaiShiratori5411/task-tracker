package com.example.tasktracker.controller;

import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.example.tasktracker.model.Habit;
import com.example.tasktracker.service.HabitService;

@Controller
@RequestMapping("/habits")
public class HabitController {
    
    private static final Logger logger = LoggerFactory.getLogger(HabitController.class);
    
    @Autowired
    private HabitService habitService;

    // 習慣一覧表示
    @GetMapping
    public String listHabits(Model model) {
        try {
            List<Habit> habits = habitService.getAllHabits();
            model.addAttribute("habits", habits);
            model.addAttribute("today", LocalDate.now());
            // 過去30日分の日付を生成
            List<LocalDate> last30Days = LocalDate.now()
                .datesUntil(LocalDate.now().plusDays(30))
                .toList();
            model.addAttribute("last30Days", last30Days);
            return "habits/list";
        } catch (Exception e) {
            logger.error("習慣一覧の取得中にエラーが発生しました", e);
            return "redirect:/";
        }
    }

    // 習慣作成フォーム表示
    @GetMapping("/create")
    public String createHabitForm(Model model) {
        model.addAttribute("habit", new Habit());
        return "habits/form";
    }

    // 習慣作成処理
    @PostMapping
    public String createHabit(@ModelAttribute Habit habit, RedirectAttributes redirectAttributes) {
        try {
            habitService.createHabit(habit);
            redirectAttributes.addFlashAttribute("message", "習慣を作成しました");
            return "redirect:/habits";
        } catch (Exception e) {
            logger.error("習慣の作成中にエラーが発生しました", e);
            redirectAttributes.addFlashAttribute("error", "習慣の作成に失敗しました");
            return "redirect:/habits";
        }
    }

    // 習慣編集フォーム表示
    @GetMapping("/edit/{id}")
    public String editHabitForm(@PathVariable Long id, Model model) {
        try {
            Habit habit = habitService.getHabitById(id);
            if (habit == null) {
                return "redirect:/habits";
            }
            model.addAttribute("habit", habit);
            return "habits/form";
        } catch (Exception e) {
            logger.error("習慣の編集フォーム表示中にエラーが発生しました", e);
            return "redirect:/habits";
        }
    }

    // 習慣更新処理
    @PostMapping("/edit/{id}")
    public String updateHabit(@PathVariable Long id, @ModelAttribute Habit habit, RedirectAttributes redirectAttributes) {
        try {
            habit.setId(id);
            habitService.updateHabit(habit);
            redirectAttributes.addFlashAttribute("message", "習慣を更新しました");
            return "redirect:/habits";
        } catch (Exception e) {
            logger.error("習慣の更新中にエラーが発生しました", e);
            redirectAttributes.addFlashAttribute("error", "習慣の更新に失敗しました");
            return "redirect:/habits";
        }
    }

    // 習慣完了マーク
    @PostMapping("/{id}/complete")
    @ResponseBody
    public void markComplete(@PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            habitService.markComplete(id, date);
        } catch (Exception e) {
            logger.error("習慣の完了マーク中にエラーが発生しました", e);
            throw e;
        }
    }

    // 習慣未完了マーク
    @PostMapping("/{id}/incomplete")
    @ResponseBody
    public void markIncomplete(@PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            habitService.markIncomplete(id, date);
        } catch (Exception e) {
            logger.error("習慣の未完了マーク中にエラーが発生しました", e);
            throw e;
        }
    }

    // 習慣削除
    @DeleteMapping("/{id}")
    @ResponseBody
    public String deleteHabit(@PathVariable Long id) {
        try {
            habitService.deleteHabit(id);
            return "success";
        } catch (Exception e) {
            logger.error("習慣の削除中にエラーが発生しました", e);
            throw e;
        }
    }
}
