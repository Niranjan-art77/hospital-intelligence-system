package com.example.demo.controller;

import com.example.demo.entity.Notification;
import com.example.demo.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(originPatterns = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/unread")
    public List<Notification> getUnreadNotifications() {
        return notificationService.getUnreadNotifications();
    }

    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationService.createNotification(notification.getMessage(), notification.getType());
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead() {
        notificationService.markAllAsRead();
    }
}
