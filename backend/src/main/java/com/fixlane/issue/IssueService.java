package com.fixlane.issue;

import com.fixlane.auth.AuthService;
import com.fixlane.project.Project;
import com.fixlane.project.ProjectRepository;
import com.fixlane.user.User;
import com.fixlane.user.UserRepository;
import com.fixlane.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<IssueDto> listIssuesByProject(UUID projectId, IssueStatus status, IssuePriority priority,
                                             Boolean mine, String q, User currentUser) {
        UUID assigneeFilter = (mine != null && mine) ? currentUser.getId() : null;
        List<Issue> issues = issueRepository.findFilteredIssues(projectId, status, priority, assigneeFilter, q);
        return issues.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IssueDto getIssueByKey(String key) {
        Issue issue = issueRepository.findByKey(key)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found: " + key));
        return toDto(issue);
    }

    @Transactional
    public IssueDto createIssue(CreateIssueRequest request, User currentUser) {
        Project project = projectRepository.findByIdWithLock(request.getProjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        int nextNumber = project.getIssueCounter() + 1;
        project.setIssueCounter(nextNumber);
        projectRepository.save(project);

        String issueKey = project.getKey() + "-" + nextNumber;

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId()).orElse(null);
        }

        Issue issue = Issue.builder()
                .key(issueKey)
                .number(nextNumber)
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : IssuePriority.MEDIUM)
                .status(IssueStatus.TODO)
                .assignee(assignee)
                .reporter(currentUser)
                .dueDate(request.getDueDate())
                .position(nextNumber)
                .build();

        return toDto(issueRepository.save(issue));
    }

    @Transactional
    public IssueDto updateIssue(String key, UpdateIssueRequest request, User currentUser) {
        Issue issue = issueRepository.findByKey(key)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));

        // Permission: Admin, Manager, or Reporter
        if (currentUser.getRole() == UserRole.DEVELOPER && !issue.getReporter().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Admin, Manager, or the reporter can edit this issue");
        }

        if (request.getTitle() != null) issue.setTitle(request.getTitle());
        if (request.getDescription() != null) issue.setDescription(request.getDescription());
        if (request.getStatus() != null) issue.setStatus(request.getStatus());
        if (request.getPriority() != null) issue.setPriority(request.getPriority());
        if (request.getDueDate() != null) issue.setDueDate(request.getDueDate());
        if (request.getAssigneeId() != null) {
            userRepository.findById(request.getAssigneeId()).ifPresent(issue::setAssignee);
        }

        return toDto(issueRepository.save(issue));
    }

    @Transactional
    public void deleteIssue(String key, User currentUser) {
        Issue issue = issueRepository.findByKey(key)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));

        // Permission: Admin, Manager, or Reporter
        if (currentUser.getRole() == UserRole.DEVELOPER && !issue.getReporter().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Admin, Manager, or the reporter can delete this issue");
        }

        issueRepository.delete(issue);
    }

    @Transactional
    public IssueDto updateStatus(String key, StatusUpdateRequest request, User currentUser) {
        Issue issue = issueRepository.findByKey(key)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));

        // Permission: Admin, Manager, or Assigned Developer
        if (currentUser.getRole() == UserRole.DEVELOPER) {
            if (issue.getAssignee() == null || !issue.getAssignee().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Developers can only move issues assigned to them");
            }
        }

        issue.setStatus(request.getStatus());
        if (request.getOrderIndex() != null) {
            issue.setPosition(request.getOrderIndex());
        }

        return toDto(issueRepository.save(issue));
    }

    @Transactional
    public IssueDto updateAssignee(String key, AssigneeUpdateRequest request, User currentUser) {
        Issue issue = issueRepository.findByKey(key)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));

        if (request.getAssigneeId() == null) {
            if (currentUser.getRole() == UserRole.DEVELOPER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Developers cannot unassign issues");
            }
            issue.setAssignee(null);
        } else {
            // Permission: Developers can only assign to themselves
            if (currentUser.getRole() == UserRole.DEVELOPER && !request.getAssigneeId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Developers can only assign issues to themselves");
            }
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignee not found"));
            issue.setAssignee(assignee);
        }

        return toDto(issueRepository.save(issue));
    }

    @Transactional
    public void reorderIssues(UUID projectId, ReorderRequest request) {
        if (request.getIssueIds() != null) {
            for (int i = 0; i < request.getIssueIds().size(); i++) {
                UUID id = request.getIssueIds().get(i);
                int position = i;
                issueRepository.findById(id).ifPresent(issue -> {
                    issue.setPosition(position);
                    issueRepository.save(issue);
                });
            }
        }
    }

    public IssueDto toDto(Issue issue) {
        return IssueDto.builder()
                .id(issue.getId())
                .key(issue.getKey())
                .number(issue.getNumber())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .status(issue.getStatus())
                .priority(issue.getPriority())
                .projectId(issue.getProject().getId())
                .projectKey(issue.getProject().getKey())
                .assigneeId(issue.getAssignee() != null ? issue.getAssignee().getId() : null)
                .assigneeName(issue.getAssignee() != null ? issue.getAssignee().getFullName() : null)
                .assignee(issue.getAssignee() != null ? authService.toUserDto(issue.getAssignee()) : null)
                .reporterId(issue.getReporter() != null ? issue.getReporter().getId() : null)
                .reporterName(issue.getReporter() != null ? issue.getReporter().getFullName() : null)
                .reporter(issue.getReporter() != null ? authService.toUserDto(issue.getReporter()) : null)
                .dueDate(issue.getDueDate())
                .orderIndex(issue.getPosition())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .build();
    }
}
