package com.fixlane.auth;

import com.fixlane.user.UserRole;
import com.fixlane.user.UserStatus;
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
public class UserDto {
    private UUID id;
    private String fullName;
    private String email;
    private UserRole role;
    private UserStatus status;
    private OffsetDateTime createdAt;
}
