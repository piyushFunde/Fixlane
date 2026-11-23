package com.fixlane.security;

import com.fixlane.auth.AuthResponse;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-expiry-ms}")
    private long accessExpiryMs;

    @Value("${app.jwt.refresh-expiry-ms}")
    private long refreshExpiryMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            keyBytes = new byte[32];
            System.arraycopy(secretBytes, 0, keyBytes, 0, secretBytes.length);
        } else {
            keyBytes = secretBytes;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(UserDetails userDetails) {
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("DEVELOPER");

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiryMs))
                .signWith(getSigningKey())
                .compact();
    }

    @Transactional
    public String generateRefreshToken(UUID userId) {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[64];
        random.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        saveRefreshToken(userId, rawToken);
        return rawToken;
    }

    @Transactional
    public void saveRefreshToken(UUID userId, String rawToken) {
        String hash = passwordEncoder.encode(rawToken);
        RefreshToken token = RefreshToken.builder()
                .userId(userId)
                .tokenHash(hash)
                .expiresAt(OffsetDateTime.now().plusSeconds(refreshExpiryMs / 1000))
                .revoked(false)
                .build();
        refreshTokenRepository.save(token);
    }

    public Claims validateAccessToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Transactional
    public AuthResponse rotateRefreshToken(String rawToken, UUID userId,
                                           UserDetails userDetails) {
        List<RefreshToken> activeTokens = refreshTokenRepository
                .findByUserIdAndRevokedFalseAndExpiresAtAfter(userId, OffsetDateTime.now());

        RefreshToken matched = null;
        for (RefreshToken rt : activeTokens) {
            if (passwordEncoder.matches(rawToken, rt.getTokenHash())) {
                matched = rt;
                break;
            }
        }

        if (matched == null) {
            // Check if it was a revoked token (potential theft)
            // Revoke all tokens for safety and throw 401
            refreshTokenRepository.revokeAllByUserId(userId);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        // Revoke matched token
        matched.setRevoked(true);
        refreshTokenRepository.save(matched);

        // Generate new pair
        String newAccessToken = generateAccessToken(userDetails);
        String newRefreshToken = generateRefreshToken(userId);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    @Transactional
    public void revokeRefreshToken(String rawToken, UUID userId) {
        List<RefreshToken> activeTokens = refreshTokenRepository
                .findByUserIdAndRevokedFalseAndExpiresAtAfter(userId, OffsetDateTime.now());

        for (RefreshToken rt : activeTokens) {
            if (passwordEncoder.matches(rawToken, rt.getTokenHash())) {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
                return;
            }
        }
    }
}
