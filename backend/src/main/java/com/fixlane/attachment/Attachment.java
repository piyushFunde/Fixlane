package com.fixlane.attachment;

import com.fixlane.common.AuditEntity;
import com.fixlane.issue.Issue;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attachment extends AuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "content_type", length = 100)
    private String contentType;

    private Long size;

    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;
}
