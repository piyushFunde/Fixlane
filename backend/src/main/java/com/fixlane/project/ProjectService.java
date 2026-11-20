package com.fixlane.project;

import com.fixlane.auth.AuthService;
import com.fixlane.auth.UserDto;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<ProjectDto> listProjects(User currentUser) {
        List<Project> projects;
        if (currentUser.getRole() == UserRole.ADMIN) {
            projects = projectRepository.findAll();
        } else {
            projects = projectRepository.findAllByUserId(currentUser.getId());
        }
        return projects.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getProject(UUID id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        return toDto(project);
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request, User currentUser) {
        if (currentUser.getRole() == UserRole.DEVELOPER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Developers cannot create projects");
        }

        if (projectRepository.existsByKey(request.getKey().toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Project key already exists");
        }

        User lead = null;
        if (request.getLeadId() != null) {
            lead = userRepository.findById(request.getLeadId()).orElse(null);
        }
        if (lead == null) {
            lead = currentUser;
        }

        Project project = Project.builder()
                .name(request.getName())
                .key(request.getKey().toUpperCase())
                .description(request.getDescription())
                .lead(lead)
                .issueCounter(0)
                .build();

        project = projectRepository.save(project);

        // Add lead / creator as member
        ProjectMember member = ProjectMember.builder()
                .id(new ProjectMemberId(project.getId(), currentUser.getId()))
                .project(project)
                .user(currentUser)
                .build();
        projectMemberRepository.save(member);

        return toDto(project);
    }

    @Transactional
    public ProjectDto updateProject(UUID id, UpdateProjectRequest request, User currentUser) {
        if (currentUser.getRole() == UserRole.DEVELOPER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Developers cannot update projects");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getLeadId() != null) {
            userRepository.findById(request.getLeadId()).ifPresent(project::setLead);
        }

        return toDto(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(UUID id, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can delete projects");
        }
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getMembers(UUID projectId) {
        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(pm -> authService.toUserDto(pm.getUser()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addMember(UUID projectId, UUID userId, User currentUser) {
        if (currentUser.getRole() == UserRole.DEVELOPER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Developers cannot manage project members");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            return;
        }

        ProjectMember member = ProjectMember.builder()
                .id(new ProjectMemberId(projectId, userId))
                .project(project)
                .user(user)
                .build();
        projectMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(UUID projectId, UUID userId, User currentUser) {
        if (currentUser.getRole() == UserRole.DEVELOPER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Developers cannot manage project members");
        }

        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    public ProjectDto toDto(Project project) {
        List<UserDto> memberDtos = project.getMembers() != null
                ? project.getMembers().stream().map(pm -> authService.toUserDto(pm.getUser())).collect(Collectors.toList())
                : List.of();

        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .key(project.getKey())
                .description(project.getDescription())
                .leadId(project.getLead() != null ? project.getLead().getId() : null)
                .leadName(project.getLead() != null ? project.getLead().getFullName() : null)
                .lead(project.getLead() != null ? authService.toUserDto(project.getLead()) : null)
                .totalIssues(project.getIssueCounter())
                .doneIssues(0)
                .members(memberDtos)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }
}

