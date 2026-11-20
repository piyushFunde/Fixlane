package com.fixlane.dashboard;

import com.fixlane.issue.IssueDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long assignedCount;
    private long highPriorityAssignedCount;
    private long inProgressCount;
    private long projectCount;
    private long dueThisWeekCount;
    private long doneThisSprintCount;
    private long totalSprintPlanned;
    private Map<String, Long> priorityCounts;
    private SprintProgressDto sprintProgress;
    private List<IssueDto> assignedIssues;
    private List<ActivityItemDto> recentActivities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SprintProgressDto {
        private String sprintName;
        private String projectName;
        private String endDate;
        private long done;
        private long inProgress;
        private long todo;
        private long total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityItemDto {
        private UUID id;
        private ActivityUserDto user;
        private String action;
        private String issueKey;
        private String issueTitle;
        private OffsetDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityUserDto {
        private UUID id;
        private String fullName;
    }
}
