package com.luxurystay.security;

import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpiration;

    @Value("${jwt.issuer:LuxuryStay}")
    private String issuer;

    @Value("${clerk.jwks-url:https://engaging-fish-44.clerk.accounts.dev/.well-known/jwks.json}")
    private String clerkJwksUrl;

    // Cache JWKS keys
    private final Map<String, RSAPublicKey> clerkKeys = new ConcurrentHashMap<>();
    private long lastJwksFetch = 0;
    private static final long JWKS_CACHE_TTL = 3600000; // 1 hour

    @PostConstruct
    public void init() {

        // Pre-fetch Clerk JWKS
        try {
            fetchClerkJwks();
            log.info("Clerk JWKS keys loaded successfully");
        } catch (Exception e) {
            log.warn("Failed to pre-fetch Clerk JWKS: {}", e.getMessage());
        }
    }



    /**
     * Extract email from Clerk token
     */
    public String getEmailFromToken(String token) {
        if (isClerkToken(token)) {
            return extractEmailFromClerkToken(token);
        }
        return null;
    }

    /**
     * Validate token - supports Clerk JWT only
     */
    public boolean validateToken(String token) {
        try {
            if (isClerkToken(token)) {
                return validateClerkToken(token);
            }
            log.error("Token is not a valid Clerk JWT");
            return false;
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if token is a Clerk JWT (3-part base64 with "eyJ" header)
     */
    private boolean isClerkToken(String token) {
        if (token == null) return false;
        String[] parts = token.split("\\.");
        if (parts.length != 3) return false;
        // Clerk tokens start with eyJ and contain "kid" in header
        try {
            String header = new String(java.util.Base64.getUrlDecoder().decode(parts[0]));
            boolean isValid = header.contains("\"kid\"") && header.contains("\"alg\"") && !header.contains("HS256");
            if (!isValid) {
                log.error("Clerk token header validation failed. Header: {}", header);
            }
            return isValid;
        } catch (Exception e) {
            log.error("Failed to decode token header: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Validate a Clerk JWT token using JWKS
     */
    private boolean validateClerkToken(String token) {
        try {
            // Refresh JWKS if needed
            refreshJwksIfNeeded();

            JWSObject jwsObject = JWSObject.parse(token);

            String keyId = jwsObject.getHeader().getKeyID();
            RSAPublicKey publicKey = clerkKeys.get(keyId);

            if (publicKey == null) {
                // Key not found - refresh JWKS and try again
                fetchClerkJwks();
                publicKey = clerkKeys.get(keyId);
            }

            if (publicKey == null) {
                log.error("No matching public key found for kid: {}", keyId);
                return false;
            }

            JWSVerifier verifier = new RSASSAVerifier(publicKey);
            boolean verified = jwsObject.verify(verifier);

            if (!verified) {
                log.error("Clerk token signature verification failed using public key for kid: {}", keyId);
            } else {
                // Check expiration
                Object expObj = jwsObject.getPayload().toJSONObject().get("exp");
                if (expObj != null) {
                    long expSeconds = 0;
                    if (expObj instanceof Number) {
                        expSeconds = ((Number) expObj).longValue();
                    }
                    if (expSeconds > 0) {
                        Date expirationTime = new Date(expSeconds * 1000);
                        if (expirationTime.before(new Date())) {
                            log.error("Clerk token has expired");
                            return false;
                        }
                    }
                }

                // Check issuer
                String iss = (String) jwsObject.getPayload().toJSONObject().get("iss");
                if (iss != null && !iss.contains("clerk.accounts.dev")) {
                    log.error("Invalid token issuer: {}", iss);
                    return false;
                }
            }

            return verified;
        } catch (Exception e) {
            log.error("Clerk token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract email (sub claim) from Clerk JWT
     */
    private String extractEmailFromClerkToken(String token) {
        try {
            JWSObject jwsObject = JWSObject.parse(token);
            Map<String, Object> payload = jwsObject.getPayload().toJSONObject();

            // Clerk uses 'sub' as user ID and 'email' claim
            String email = (String) payload.get("email");
            if (email != null) return email;

            // If no email claim, use sub (user_xxx format)
            String sub = (String) payload.get("sub");
            if (sub != null) return sub;

            return null;
        } catch (Exception e) {
            log.error("Failed to extract email from Clerk token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Get user ID (sub claim) from Clerk JWT
     */
    public String getUserIdFromToken(String token) {
        try {
            JWSObject jwsObject = JWSObject.parse(token);
            return (String) jwsObject.getPayload().toJSONObject().get("sub");
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extract role from Clerk JWT (public_metadata.role)
     */
    public String getRoleFromToken(String token) {
        try {
            JWSObject jwsObject = JWSObject.parse(token);
            Map<String, Object> payload = jwsObject.getPayload().toJSONObject();

            Object publicMetadata = payload.get("public_metadata");
            if (publicMetadata instanceof Map<?, ?> metadataMap) {
                Object roleObj = metadataMap.get("role");
                if (roleObj instanceof String role) {
                    return role.toUpperCase();
                }
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to extract role from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Fetch JWKS from Clerk
     */
    private void fetchClerkJwks() {
        try {
            JWKSet jwkSet = JWKSet.load(new URL(clerkJwksUrl));
            clerkKeys.clear();
            for (JWK jwk : jwkSet.getKeys()) {
                if (jwk instanceof RSAKey rsaKey) {
                    clerkKeys.put(rsaKey.getKeyID(), rsaKey.toRSAPublicKey());
                }
            }
            lastJwksFetch = System.currentTimeMillis();
            log.info("Fetched {} Clerk JWKS keys", clerkKeys.size());
        } catch (Exception e) {
            log.error("Failed to fetch Clerk JWKS: {}", e.getMessage());
        }
    }

    /**
     * Refresh JWKS if cache has expired
     */
    private void refreshJwksIfNeeded() {
        if (System.currentTimeMillis() - lastJwksFetch > JWKS_CACHE_TTL) {
            fetchClerkJwks();
        }
    }

    public long getJwtExpiration() {
        return jwtExpiration;
    }
}
