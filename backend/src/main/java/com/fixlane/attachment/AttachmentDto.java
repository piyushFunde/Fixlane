package com.fixlane.attachment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentDto {
    private UUID id;
    private UUID issueId;
    private String filename;
    private String fileUrl;
    private Long fileSize;
    private String contentType;
    private OffsetDateTime createdAt;
}
