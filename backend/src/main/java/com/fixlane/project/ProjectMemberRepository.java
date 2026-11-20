package com.fixlane.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMemberId> {
    List<ProjectMember> findByProjectId(UUID projectId);
    boolean existsByProjectIdAndUserId(UUID projectId, UUID userId);
    void deleteByProjectIdAndUserId(UUID projectId, UUID userId);
}

