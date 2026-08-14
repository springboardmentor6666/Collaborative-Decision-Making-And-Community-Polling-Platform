package com.decisionhub.security.oauth;

import com.decisionhub.dto.AuthResponse;
import com.decisionhub.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            response.sendRedirect(frontendUrl + "/login?error=oauth_invalid");
            return;
        }

        OAuth2User oauth2User = oauthToken.getPrincipal();
        String provider = oauthToken.getAuthorizedClientRegistrationId().toUpperCase();
        String providerId = resolveProviderId(oauth2User, provider);
        String email = resolveEmail(oauth2User, provider);
        String fullName = resolveName(oauth2User, provider);
        String profileImage = resolveAvatar(oauth2User, provider);

        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendUrl + "/login?error=oauth_email_missing");
            return;
        }

        AuthResponse authResponse = userService.processOAuthLogin(provider, providerId, email, fullName, profileImage);
        String redirectUrl = frontendUrl + "/login?token=" + URLEncoder.encode(authResponse.getToken(), StandardCharsets.UTF_8)
                + "&provider=" + provider.toLowerCase()
                + "&email=" + URLEncoder.encode(email, StandardCharsets.UTF_8)
                + "&name=" + URLEncoder.encode(fullName == null ? email : fullName, StandardCharsets.UTF_8)
                + "&avatar=" + URLEncoder.encode(profileImage == null ? "" : profileImage, StandardCharsets.UTF_8)
                + "&id=" + URLEncoder.encode(String.valueOf(providerId), StandardCharsets.UTF_8);
        response.sendRedirect(redirectUrl);
    }

    private String resolveProviderId(OAuth2User oauth2User, String provider) {
        return switch (provider) {
            case "GOOGLE" -> oauth2User.getAttribute("sub");
            case "GITHUB" -> String.valueOf(oauth2User.getAttribute("id"));
            default -> null;
        };
    }

    private String resolveEmail(OAuth2User oauth2User, String provider) {
        Object email = oauth2User.getAttribute("email");
        if (email != null) {
            return email.toString();
        }
        if ("GITHUB".equals(provider)) {
            return oauth2User.getAttribute("login");
        }
        return null;
    }

    private String resolveName(OAuth2User oauth2User, String provider) {
        if ("GOOGLE".equals(provider)) {
            return oauth2User.getAttribute("name");
        }
        return oauth2User.getAttribute("name");
    }

    private String resolveAvatar(OAuth2User oauth2User, String provider) {
        if ("GOOGLE".equals(provider)) {
            return oauth2User.getAttribute("picture");
        }
        return oauth2User.getAttribute("avatar_url");
    }
}
