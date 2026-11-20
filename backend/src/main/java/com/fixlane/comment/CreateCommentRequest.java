package com.fixlane.comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {
    private String content;
    private String body;

    public String getText() {
        if (content != null && !content.isBlank()) return content;
        if (body != null && !body.isBlank()) return body;
        return "";
    }
}
