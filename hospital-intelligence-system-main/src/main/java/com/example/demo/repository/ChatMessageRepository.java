package com.example.demo.repository;

import com.example.demo.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT c FROM ChatMessage c WHERE (c.senderId = :user1 AND c.receiverId = :user2) OR (c.senderId = :user2 AND c.receiverId = :user1) ORDER BY c.timestamp ASC")
    List<ChatMessage> findConversation(@Param("user1") Long user1, @Param("user2") Long user2);

}
