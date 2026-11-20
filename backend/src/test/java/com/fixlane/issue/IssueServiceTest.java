package com.fixlane.issue;

import com.fixlane.auth.AuthService;
import com.fixlane.project.Project;
import com.fixlane.project.ProjectRepository;
import com.fixlane.user.User;
import com.fixlane.user.UserRepository;
import com.fixlane.user.UserRole;
import com.fixlane.user.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IssueServiceTest {

    @Mock
    private IssueRepository issueRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthService authService;

    @InjectMocks
    private IssueService issueService;

    private User devUser;
    private User managerUser;
    private Project project;

    @BeforeEach
    void setUp() {
        devUser = User.builder()
                .id(UUID.randomUUID())
                .fullName("Dev User")
                .email("dev@fixlane.dev")
                .role(UserRole.DEVELOPER)
                .status(UserStatus.ACTIVE)
                .build();

        managerUser = User.builder()
                .id(UUID.randomUUID())
                .fullName("Manager User")
                .email("manager@fixlane.dev")
                .role(UserRole.MANAGER)
                .status(UserStatus.ACTIVE)
                .build();

        project = Project.builder()
                .id(UUID.randomUUID())
                .name("Payments API")
                .key("PAY")
                .issueCounter(5)
                .build();
    }

    @Test
    void createIssue_incrementsIssueCounterAndSetsKey() {
        CreateIssueRequest request = CreateIssueRequest.builder()
                .projectId(project.getId())
                .title("New Payment Gateway Bug")
                .priority(IssuePriority.HIGH)
                .build();

        when(projectRepository.findByIdWithLock(project.getId())).thenReturn(Optional.of(project));
        when(issueRepository.save(any(Issue.class))).thenAnswer(inv -> inv.getArgument(0));

        IssueDto result = issueService.createIssue(request, devUser);

        assertThat(result.getKey()).isEqualTo("PAY-6");
        assertThat(result.getNumber()).isEqualTo(6);
        assertThat(project.getIssueCounter()).isEqualTo(6);
        verify(projectRepository).save(project);
    }

    @Test
    void updateStatus_unassignedDeveloper_throwsForbidden() {
        Issue issue = Issue.builder()
                .id(UUID.randomUUID())
                .key("PAY-1")
                .project(project)
                .title("Test")
                .reporter(managerUser)
                .assignee(null)
                .build();

        when(issueRepository.findByKey("PAY-1")).thenReturn(Optional.of(issue));

        StatusUpdateRequest request = StatusUpdateRequest.builder()
                .status(IssueStatus.IN_PROGRESS)
                .build();

        assertThatThrownBy(() -> issueService.updateStatus("PAY-1", request, devUser))
                .isInstanceOf(ResponseStatusException.class);
    }
}
