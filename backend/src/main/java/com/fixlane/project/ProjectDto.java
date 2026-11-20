package com.fixlane.project;

import com.fixlane.auth.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private UUID id;
    private String name;
    private String key;
    private String description;
    private UUID leadId;
    private String leadName;
    private UserDto lead;
    private Integer totalIssues;
    private Integer doneIssues;
    private List<UserDto> members;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

