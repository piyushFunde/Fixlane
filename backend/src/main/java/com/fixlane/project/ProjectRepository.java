package com.fixlane.project;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    boolean existsByKey(String key);
    Optional<Project> findByKey(String key);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Project p WHERE p.id = :id")
    Optional<Project> findByIdWithLock(@Param("id") UUID id);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members pm WHERE p.lead.id = :userId OR pm.user.id = :userId")
    List<Project> findAllByUserId(@Param("userId") UUID userId);
}

