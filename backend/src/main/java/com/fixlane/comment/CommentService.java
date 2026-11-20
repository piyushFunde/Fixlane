package com.fixlane.comment;

import com.fixlane.auth.AuthService;
import com.fixlane.issue.Issue;
import com.fixlane.issue.IssueRepository;
import com.fixlane.user.User;
import com.fixlane.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<CommentDto> listComments(String issueKeyOrId) {
        Issue issue = findIssue(issueKeyOrId);
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issue.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(String issueKeyOrId, CreateCommentRequest request, User currentUser) {
        Issue issue = findIssue(issueKeyOrId);

        String text = request.getText();
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment body cannot be blank");
        }

        Comment comment = Comment.builder()
                .issue(issue)
                .author(currentUser)
                .body(text)
                .build();

        return toDto(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(UUID commentId, User currentUser) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (currentUser.getRole() != UserRole.ADMIN && !comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the author or Admin can delete this comment");
        }

        commentRepository.delete(comment);
    }

    private Issue findIssue(String keyOrId) {
        try {
            UUID id = UUID.fromString(keyOrId);
            return issueRepository.findById(id)
                    .orElseGet(() -> issueRepository.findByKey(keyOrId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found")));
        } catch (IllegalArgumentException e) {
            return issueRepository.findByKey(keyOrId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
        }
    }

    public CommentDto toDto(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .issueId(comment.getIssue().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getFullName())
                .author(authService.toUserDto(comment.getAuthor()))
                .content(comment.getBody())
                .body(comment.getBody())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
