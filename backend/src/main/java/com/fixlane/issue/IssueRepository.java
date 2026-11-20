package com.fixlane.issue;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IssueRepository extends JpaRepository<Issue, UUID> {

    Optional<Issue> findByKey(String key);
    boolean existsByKey(String key);

    @Query("SELECT i FROM Issue i WHERE i.project.id = :projectId " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:priority IS NULL OR i.priority = :priority) " +
           "AND (:assigneeId IS NULL OR i.assignee.id = :assigneeId) " +
           "AND (:q IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(i.key) LIKE LOWER(CONCAT('%', :q, '%'))) " +
           "ORDER BY i.position ASC, i.createdAt DESC")
    List<Issue> findFilteredIssues(
            @Param("projectId") UUID projectId,
            @Param("status") IssueStatus status,
            @Param("priority") IssuePriority priority,
            @Param("assigneeId") UUID assigneeId,
            @Param("q") String q
    );

    List<Issue> findByAssigneeIdAndStatusNot(UUID assigneeId, IssueStatus status);
    List<Issue> findByAssigneeId(UUID assigneeId);

    long countByAssigneeId(UUID assigneeId);
    long countByAssigneeIdAndPriority(UUID assigneeId, IssuePriority priority);
    long countByAssigneeIdAndStatus(UUID assigneeId, IssueStatus status);
    long countByStatus(IssueStatus status);
    long countByPriority(IssuePriority priority);
}
