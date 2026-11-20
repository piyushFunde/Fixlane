package com.fixlane.user;

import com.fixlane.auth.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> listUsers() {
        return ResponseEntity.ok(userService.listUsers());
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserDto> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody RoleUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.updateRole(id, request, currentUser));
    }

    @PostMapping("/invite")
    public ResponseEntity<UserDto> inviteUser(
            @Valid @RequestBody InviteUserRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.inviteUser(request, currentUser));
    }
}
