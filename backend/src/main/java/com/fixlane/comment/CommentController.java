package com.fixlane.comment;

import com.fixlane.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/issues/{issueKeyOrId}/comments")
    public ResponseEntity<List<CommentDto>> listComments(@PathVariable String issueKeyOrId) {
        return ResponseEntity.ok(commentService.listComments(issueKeyOrId));
    }

    @PostMapping("/issues/{issueKeyOrId}/comments")
    public ResponseEntity<CommentDto> addComment(
            @PathVariable String issueKeyOrId,
            @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(issueKeyOrId, request, currentUser));
    }

    @DeleteMapping("/issues/{issueKeyOrId}/comments/{commentId}")
    public ResponseEntity<Void> deleteIssueComment(
            @PathVariable String issueKeyOrId,
            @PathVariable UUID commentId,
            @AuthenticationPrincipal User currentUser) {
        commentService.deleteComment(commentId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser) {
        commentService.deleteComment(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
