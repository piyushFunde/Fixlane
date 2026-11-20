package com.fixlane.dashboard;

import com.fixlane.comment.Comment;
import com.fixlane.comment.CommentRepository;
import com.fixlane.issue.Issue;
import com.fixlane.issue.IssuePriority;
import com.fixlane.issue.IssueRepository;
import com.fixlane.issue.IssueService;
import com.fixlane.issue.IssueStatus;
import com.fixlane.project.ProjectRepository;
import com.fixlane.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final CommentRepository commentRepository;
    private final IssueService issueService;

    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary(User currentUser) {
        long assignedCount = issueRepository.countByAssigneeId(currentUser.getId());
        long highPriorityAssigned = issueRepository.countByAssigneeIdAndPriority(currentUser.getId(), IssuePriority.HIGH);
        long inProgressCount = issueRepository.countByStatus(IssueStatus.IN_PROGRESS);
        long doneCount = issueRepository.countByStatus(IssueStatus.DONE);
        long todoCount = issueRepository.countByStatus(IssueStatus.TODO);
        long totalIssues = doneCount + inProgressCount + todoCount;

        Map<String, Long> priorityCounts = new HashMap<>();
        priorityCounts.put("HIGH", issueRepository.countByPriority(IssuePriority.HIGH));
        priorityCounts.put("MEDIUM", issueRepository.countByPriority(IssuePriority.MEDIUM));
        priorityCounts.put("LOW", issueRepository.countByPriority(IssuePriority.LOW));

        List<Issue> assignedList = issueRepository.findByAssigneeIdAndStatusNot(currentUser.getId(), IssueStatus.DONE);
        List<com.fixlane.issue.IssueDto> assignedDtos = assignedList.stream()
                .limit(5)
                .map(issueService::toDto)
                .collect(Collectors.toList());

        List<DashboardSummaryDto.ActivityItemDto> activities = new ArrayList<>();
        List<Comment> recentComments = commentRepository.findTop10ByOrderByCreatedAtDesc();
        for (Comment c : recentComments) {
            activities.add(DashboardSummaryDto.ActivityItemDto.builder()
                    .id(c.getId())
                    .user(DashboardSummaryDto.ActivityUserDto.builder()
                            .id(c.getAuthor().getId())
                            .fullName(c.getAuthor().getFullName())
                            .build())
                    .action("commented on this ticket")
                    .issueKey(c.getIssue().getKey())
                    .issueTitle(c.getIssue().getTitle())
                    .timestamp(c.getCreatedAt())
                    .build());
        }

        return DashboardSummaryDto.builder()
                .assignedCount(assignedCount)
                .highPriorityAssignedCount(highPriorityAssigned)
                .inProgressCount(inProgressCount)
                .projectCount(projectRepository.count())
                .dueThisWeekCount(assignedCount > 0 ? Math.min(assignedCount, 5) : 0)
                .doneThisSprintCount(doneCount)
                .totalSprintPlanned(totalIssues > 0 ? totalIssues : 54)
                .priorityCounts(priorityCounts)
                .sprintProgress(DashboardSummaryDto.SprintProgressDto.builder()
                        .sprintName("Sprint 14")
                        .projectName("Payments API")
                        .endDate("ends Fri 27 Nov")
                        .done(doneCount)
                        .inProgress(inProgressCount)
                        .todo(todoCount)
                        .total(totalIssues > 0 ? totalIssues : 1)
                        .build())
                .assignedIssues(assignedDtos)
                .recentActivities(activities)
                .build();
    }
}
