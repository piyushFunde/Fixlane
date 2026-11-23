package com.fixlane.attachment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping("/issues/{issueKey}/attachments")
    public ResponseEntity<List<AttachmentDto>> listAttachments(@PathVariable String issueKey) {
        return ResponseEntity.ok(attachmentService.listAttachments(issueKey));
    }

    @PostMapping("/issues/{issueKey}/attachments")
    public ResponseEntity<AttachmentDto> uploadAttachment(
            @PathVariable String issueKey,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(attachmentService.uploadAttachment(issueKey, file));
    }

    @GetMapping("/attachments/{id}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable UUID id) {
        Attachment attachment = attachmentService.getAttachment(id);
        Resource file = attachmentService.loadAsResource(attachment);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (attachment.getContentType() != null) {
            try {
                mediaType = MediaType.parseMediaType(attachment.getContentType());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid content type '{}' for attachment {}, falling back to octet-stream",
                        attachment.getContentType(), id, e);
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + attachment.getFileName() + "\"")
                .body(file);
    }
}
