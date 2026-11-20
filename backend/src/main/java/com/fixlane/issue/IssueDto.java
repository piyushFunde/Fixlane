package com.fixlane.issue;

import com.fixlane.auth.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueDto {
    private UUID id;
    private String key;
    private Integer number;
    private String title;
    private String description;
    private IssueStatus status;
    private IssuePriority priority;
    private UUID projectId;
    private String projectKey;
    private UUID assigneeId;
    private String assigneeName;
    private UserDto assignee;
    private UUID reporterId;
    private String reporterName;
    private UserDto reporter;
    private LocalDate dueDate;
    private Integer orderIndex;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
