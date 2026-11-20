package com.fixlane.issue;

import com.fixlane.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @GetMapping("/projects/{projectId}/issues")
    public ResponseEntity<List<IssueDto>> listIssuesByProject(
            @PathVariable UUID projectId,
            @RequestParam(required = false) IssueStatus status,
            @RequestParam(required = false) IssuePriority priority,
            @RequestParam(required = false) Boolean mine,
            @RequestParam(required = false) String q,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(issueService.listIssuesByProject(projectId, status, priority, mine, q, currentUser));
    }

    @PostMapping("/projects/{projectId}/issues/reorder")
    public ResponseEntity<Void> reorderIssues(
            @PathVariable UUID projectId,
            @RequestBody ReorderRequest request) {
        issueService.reorderIssues(projectId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/issues")
    public ResponseEntity<IssueDto> createIssue(
            @Valid @RequestBody CreateIssueRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(issueService.createIssue(request, currentUser));
    }

    @PostMapping("/projects/{projectId}/issues")
    public ResponseEntity<IssueDto> createProjectIssue(
            @PathVariable UUID projectId,
            @Valid @RequestBody CreateIssueRequest request,
            @AuthenticationPrincipal User currentUser) {
        request.setProjectId(projectId);
        return ResponseEntity.status(HttpStatus.CREATED).body(issueService.createIssue(request, currentUser));
    }

    @GetMapping("/issues/{key}")
    public ResponseEntity<IssueDto> getIssueByKey(@PathVariable String key) {
        return ResponseEntity.ok(issueService.getIssueByKey(key));
    }

    @PutMapping("/issues/{key}")
    public ResponseEntity<IssueDto> updateIssue(
            @PathVariable String key,
            @Valid @RequestBody UpdateIssueRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(issueService.updateIssue(key, request, currentUser));
    }

    @DeleteMapping("/issues/{key}")
    public ResponseEntity<Void> deleteIssue(
            @PathVariable String key,
            @AuthenticationPrincipal User currentUser) {
        issueService.deleteIssue(key, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/issues/{key}/status")
    public ResponseEntity<IssueDto> updateStatus(
            @PathVariable String key,
            @Valid @RequestBody StatusUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(issueService.updateStatus(key, request, currentUser));
    }

    @PatchMapping("/issues/{key}/assignee")
    public ResponseEntity<IssueDto> updateAssignee(
            @PathVariable String key,
            @RequestBody AssigneeUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(issueService.updateAssignee(key, request, currentUser));
    }
}
