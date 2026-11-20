package com.fixlane.config;

import com.fixlane.issue.Issue;
import com.fixlane.issue.IssuePriority;
import com.fixlane.issue.IssueRepository;
import com.fixlane.issue.IssueStatus;
import com.fixlane.project.Project;
import com.fixlane.project.ProjectMember;
import com.fixlane.project.ProjectMemberId;
import com.fixlane.project.ProjectMemberRepository;
import com.fixlane.project.ProjectRepository;
import com.fixlane.user.User;
import com.fixlane.user.UserRepository;
import com.fixlane.user.UserRole;
import com.fixlane.user.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeedDataRunner implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final IssueRepository issueRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            log.info("Seed data already present, skipping.");
            return;
        }

        log.info("Seeding initial users...");
        User admin = seedUser("Diya Kapoor", "admin@fixlane.dev", "Admin1234!", UserRole.ADMIN);
        User manager = seedUser("Kabir Nair", "manager@fixlane.dev", "Manager1234!", UserRole.MANAGER);
        User dev1 = seedUser("Rohan Iyer", "dev1@fixlane.dev", "Dev12345!", UserRole.DEVELOPER);
        User dev2 = seedUser("Sana Qureshi", "dev2@fixlane.dev", "Dev12345!", UserRole.DEVELOPER);
        User dev3 = seedUser("Aarav Mehta", "dev3@fixlane.dev", "Dev12345!", UserRole.DEVELOPER);

        List<User> allUsers = List.of(admin, manager, dev1, dev2, dev3);

        log.info("Seeding projects...");
        Project payProject = Project.builder()
                .name("Payments API")
                .key("PAY")
                .description("Core payment gateway integration, recurring billing, and Stripe webhook handling.")
                .lead(manager)
                .issueCounter(0)
                .build();
        payProject = projectRepository.save(payProject);

        Project webProject = Project.builder()
                .name("Web Frontend")
                .key("WEB")
                .description("React 18 customer dashboard, checkout flows, and self-serve billing portal.")
                .lead(admin)
                .issueCounter(0)
                .build();
        webProject = projectRepository.save(webProject);

        // Add members
        for (User u : allUsers) {
            projectMemberRepository.save(ProjectMember.builder()
                    .id(new ProjectMemberId(payProject.getId(), u.getId()))
                    .project(payProject)
                    .user(u)
                    .build());
            projectMemberRepository.save(ProjectMember.builder()
                    .id(new ProjectMemberId(webProject.getId(), u.getId()))
                    .project(webProject)
                    .user(u)
                    .build());
        }

        log.info("Seeding realistic sample issues...");
        String[][] payIssueData = {
                {"Rotate refresh tokens on every use", "HIGH", "IN_PROGRESS", "dev1"},
                {"Implement Stripe webhook signature verification", "HIGH", "IN_PROGRESS", "admin"},
                {"Drop zone flickers while dragging a card", "MEDIUM", "IN_PROGRESS", "dev1"},
                {"Validate that a project key is unique", "MEDIUM", "TODO", "dev1"},
                {"Filter bar loses its state on refresh", "LOW", "TODO", "dev1"},
                {"Add idempotency key header support to checkout API", "MEDIUM", "IN_PROGRESS", "dev2"},
                {"Add retry exponential backoff for failed card charges", "HIGH", "TODO", "dev3"},
                {"Update invoice generation tax bracket logic", "LOW", "TODO", "manager"},
                {"Migrate card token storage to encrypted KMS vault", "HIGH", "DONE", "admin"},
                {"Configure audit log streaming to CloudWatch", "MEDIUM", "DONE", "dev3"},
                {"JWT expiry not enforced on /me endpoint", "HIGH", "DONE", "dev2"},
                {"Kanban board optimistic updates rollback on 500 error", "MEDIUM", "DONE", "dev1"}
        };

        int payCounter = 0;
        for (String[] row : payIssueData) {
            payCounter++;
            User assignee = getUserByRef(row[3], admin, manager, dev1, dev2, dev3);
            issueRepository.save(Issue.builder()
                    .key("PAY-" + payCounter)
                    .number(payCounter)
                    .project(payProject)
                    .title(row[0])
                    .description("Detailed requirement and acceptance criteria for: " + row[0])
                    .priority(IssuePriority.valueOf(row[1]))
                    .status(IssueStatus.valueOf(row[2]))
                    .assignee(assignee)
                    .reporter(admin)
                    .dueDate(LocalDate.now().plusDays(payCounter % 14))
                    .position(payCounter)
                    .build());
        }
        payProject.setIssueCounter(payCounter);
        projectRepository.save(payProject);

        String[][] webIssueData = {
                {"Fix navigation drawer animation lag on iOS Safari", "MEDIUM", "TODO", "dev2"},
                {"Add dark ink theme variables to Tailwind config", "LOW", "DONE", "dev1"},
                {"Export team activity report as CSV", "MEDIUM", "TODO", "manager"},
                {"Support markdown checklist parsing in issue details", "HIGH", "IN_PROGRESS", "dev3"},
                {"Avatar initials rendering broken for single-word names", "LOW", "DONE", "dev2"},
                {"Prevent duplicate invitations sent to already registered emails", "HIGH", "TODO", "admin"},
                {"Add keyboard navigation shortcuts for Kanban columns", "MEDIUM", "TODO", "dev1"},
                {"Preload board card counts on workspace dashboard", "LOW", "DONE", "manager"}
        };

        int webCounter = 0;
        for (String[] row : webIssueData) {
            webCounter++;
            User assignee = getUserByRef(row[3], admin, manager, dev1, dev2, dev3);
            issueRepository.save(Issue.builder()
                    .key("WEB-" + webCounter)
                    .number(webCounter)
                    .project(webProject)
                    .title(row[0])
                    .description("Detailed requirement and acceptance criteria for: " + row[0])
                    .priority(IssuePriority.valueOf(row[1]))
                    .status(IssueStatus.valueOf(row[2]))
                    .assignee(assignee)
                    .reporter(manager)
                    .dueDate(LocalDate.now().plusDays(webCounter % 14))
                    .position(webCounter)
                    .build());
        }
        webProject.setIssueCounter(webCounter);
        projectRepository.save(webProject);

        log.info("Seed data loaded successfully with 5 users, 2 projects, and 20 sample issues.");
    }

    private User getUserByRef(String ref, User admin, User manager, User dev1, User dev2, User dev3) {
        return switch (ref) {
            case "admin" -> admin;
            case "manager" -> manager;
            case "dev1" -> dev1;
            case "dev2" -> dev2;
            case "dev3" -> dev3;
            default -> dev1;
        };
    }

    private User seedUser(String fullName, String email, String password, UserRole role) {
        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();
        return userRepository.save(user);
    }
}
