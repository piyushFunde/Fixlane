package com.fixlane.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    @NotBlank(message = "Key is required")
    @Pattern(regexp = "^[A-Z]{2,4}$", message = "Key must be 2-4 uppercase letters")
    private String key;

    private String description;
    private UUID leadId;
}

