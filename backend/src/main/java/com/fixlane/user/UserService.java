package com.fixlane.user;

import com.fixlane.auth.AuthService;
import com.fixlane.auth.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserDto> listUsers() {
        return userRepository.findAll().stream()
                .map(authService::toUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto updateRole(UUID userId, RoleUpdateRequest request, User currentUser) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can change user roles");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRole(request.getRole());
        return authService.toUserDto(userRepository.save(user));
    }

    @Transactional
    public UserDto inviteUser(InviteUserRequest request, User currentUser) {
        if (currentUser.getRole() == UserRole.DEVELOPER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Developers cannot invite users");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User with this email already exists");
        }

        // Default password for invited user: Dev12345!
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode("Dev12345!"))
                .role(request.getRole() != null ? request.getRole() : UserRole.DEVELOPER)
                .status(UserStatus.INVITED)
                .build();

        return authService.toUserDto(userRepository.save(user));
    }
}
