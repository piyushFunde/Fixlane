package com.fixlane.project;

import com.fixlane.auth.UserDto;
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
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDto>> listProjects(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.listProjects(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable UUID id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.getProject(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody CreateProjectRequest request,
                                                    @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable UUID id,
                                                    @Valid @RequestBody UpdateProjectRequest request,
                                                    @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(projectService.updateProject(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id,
                                              @AuthenticationPrincipal User currentUser) {
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserDto>> getMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getMembers(id));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Void> addMember(@PathVariable UUID id,
                                          @Valid @RequestBody AddMemberRequest request,
                                          @AuthenticationPrincipal User currentUser) {
        projectService.addMember(id, request.getUserId(), currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable UUID id,
                                             @PathVariable UUID userId,
                                             @AuthenticationPrincipal User currentUser) {
        projectService.removeMember(id, userId, currentUser);
        return ResponseEntity.noContent().build();
    }
}

