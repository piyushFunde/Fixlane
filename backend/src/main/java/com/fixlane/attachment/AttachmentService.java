package com.fixlane.attachment;

import com.fixlane.issue.Issue;
import com.fixlane.issue.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final IssueRepository issueRepository;
    private final Path uploadDir = Paths.get("uploads");

    @Transactional(readOnly = true)
    public List<AttachmentDto> listAttachments(String issueKey) {
        Issue issue = issueRepository.findByKey(issueKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
        return attachmentRepository.findByIssueId(issue.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttachmentDto uploadAttachment(String issueKey, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size exceeds 5MB limit");
        }

        Issue issue = issueRepository.findByKey(issueKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));

        try {
            Files.createDirectories(uploadDir);
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment";
            String storedFilename = UUID.randomUUID() + "_" + originalFilename;
            Path targetLocation = uploadDir.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = Attachment.builder()
                    .issue(issue)
                    .fileName(originalFilename)
                    .contentType(file.getContentType())
                    .size(file.getSize())
                    .storagePath(targetLocation.toString())
                    .build();

            return toDto(attachmentRepository.save(attachment));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save file", e);
        }
    }

    @Transactional(readOnly = true)
    public Attachment getAttachment(UUID id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));
    }

    public Resource loadAsResource(Attachment attachment) {
        try {
            Path file = Paths.get(attachment.getStoragePath());
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            }
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not read file");
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Could not read file", e);
        }
    }

    public AttachmentDto toDto(Attachment a) {
        return AttachmentDto.builder()
                .id(a.getId())
                .issueId(a.getIssue().getId())
                .filename(a.getFileName())
                .fileUrl("/api/v1/attachments/" + a.getId())
                .fileSize(a.getSize())
                .contentType(a.getContentType())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
