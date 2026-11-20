package com.fixlane.issue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CreateIssueRequest {
    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;

    private String description;

    @Builder.Default
    private IssuePriority priority = IssuePriority.MEDIUM;

    private UUID assigneeId;
    private LocalDate dueDate;
}
