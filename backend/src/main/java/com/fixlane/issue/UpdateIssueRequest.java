package com.fixlane.issue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateIssueRequest {
    private String title;
    private String description;
    private IssueStatus status;
    private IssuePriority priority;
    private UUID assigneeId;
    private LocalDate dueDate;
}
