package com.fixlane.security;

import com.fixlane.auth.AuthResponse;
import com.fixlane.user.User;
import com.fixlane.user.UserRole;
import com.fixlane.user.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);

    private JwtService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(refreshTokenRepository, passwordEncoder);
        ReflectionTestUtils.setField(jwtService, "secret", "test-secret-key-at-least-32-chars-long!!!");
        ReflectionTestUtils.setField(jwtService, "accessExpiryMs", 900000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiryMs", 604800000L);

        testUser = User.builder()
                .id(UUID.randomUUID())
                .fullName("Test User")
                .email("test@example.com")
                .passwordHash("hashed")
                .role(UserRole.DEVELOPER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    void generateAccessToken_thenValidateReturnsCorrectEmail() {
        String token = jwtService.generateAccessToken(testUser);

        assertThat(token).isNotBlank();

        var claims = jwtService.validateAccessToken(token);
        assertThat(claims.getSubject()).isEqualTo(testUser.getEmail());
        assertThat(claims.get("role", String.class)).isEqualTo("DEVELOPER");
    }

    @Test
    void generateRefreshToken_savesTokenAndReturnsRawString() {
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String rawToken = jwtService.generateRefreshToken(testUser.getId());

        assertThat(rawToken).isNotBlank();
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void rotateRefreshToken_success_returnsNewAuthResponse() {
        String rawToken = "myRawRefreshToken";
        String hash = passwordEncoder.encode(rawToken);

        RefreshToken storedToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .userId(testUser.getId())
                .tokenHash(hash)
                .expiresAt(OffsetDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByUserIdAndRevokedFalseAndExpiresAtAfter(eq(testUser.getId()), any()))
                .thenReturn(List.of(storedToken));
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = jwtService.rotateRefreshToken(rawToken, testUser.getId(), testUser);

        assertThat(response.getAccessToken()).isNotBlank();
        assertThat(response.getRefreshToken()).isNotBlank();
        assertThat(storedToken.isRevoked()).isTrue();
    }

    @Test
    void rotateRefreshToken_invalidToken_throws401() {
        when(refreshTokenRepository.findByUserIdAndRevokedFalseAndExpiresAtAfter(any(), any()))
                .thenReturn(List.of());

        assertThatThrownBy(() -> jwtService.rotateRefreshToken("wrongToken", testUser.getId(), testUser))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode().value())
                        .isEqualTo(HttpStatus.UNAUTHORIZED.value()));
    }
}
