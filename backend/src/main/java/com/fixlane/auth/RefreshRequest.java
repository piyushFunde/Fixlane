package com.fixlane.auth;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}
