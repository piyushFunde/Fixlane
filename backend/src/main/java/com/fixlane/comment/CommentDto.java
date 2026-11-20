package com.fixlane.comment;

import com.fixlane.auth.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private UUID id;
    private UUID issueId;
    private UUID authorId;
    private String authorName;
    private UserDto author;
    private String content;
    private String body;
    private OffsetDateTime createdAt;
}
