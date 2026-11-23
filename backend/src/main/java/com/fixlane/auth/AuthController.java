package com.fixlane.auth;

import com.fixlane.user.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth endpoints")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";
    private static final int REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                  HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        setRefreshCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "Login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        setRefreshCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh tokens")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request,
                                                 HttpServletResponse response,
                                                 @RequestBody(required = false) RefreshRequest body,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        String rawToken = getRefreshTokenFromCookieOrBody(request, body);

        if (rawToken == null) {
            return ResponseEntity.badRequest().build();
        }

        User user = authService.loadUserByEmail(userDetails.getUsername());
        AuthResponse authResponse = authService.refresh(rawToken, user);
        setRefreshCookie(response, authResponse.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout")
    public ResponseEntity<Void> logout(HttpServletRequest request,
                                        HttpServletResponse response,
                                        @RequestBody(required = false) RefreshRequest body,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        String rawToken = getRefreshTokenFromCookieOrBody(request, body);
        if (rawToken != null && userDetails != null) {
            User user = authService.loadUserByEmail(userDetails.getUsername());
            authService.logout(rawToken, user);
        }
        clearRefreshCookie(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.loadUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(authService.toUserDto(user));
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        // Set secure httpOnly cookie via header to support SameSite=Strict
        response.addHeader("Set-Cookie",
                REFRESH_COOKIE_NAME + "=" + token +
                        "; Path=/api/v1/auth; HttpOnly; Secure; Max-Age=" + REFRESH_COOKIE_MAX_AGE +
                        "; SameSite=Strict");
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        response.addHeader("Set-Cookie",
                REFRESH_COOKIE_NAME + "=; Path=/api/v1/auth; HttpOnly; Secure; Max-Age=0; SameSite=Strict");
    }

    private String getRefreshTokenFromCookieOrBody(HttpServletRequest request, RefreshRequest body) {
        // Try cookie first
        if (request.getCookies() != null) {
            return Arrays.stream(request.getCookies())
                    .filter(c -> REFRESH_COOKIE_NAME.equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElseGet(() -> body != null ? body.getRefreshToken() : null);
        }
        return body != null ? body.getRefreshToken() : null;
    }
}
