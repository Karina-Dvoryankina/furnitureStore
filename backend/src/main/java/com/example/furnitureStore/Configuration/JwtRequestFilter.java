package com.example.furnitureStore.Configuration;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {
    private final JWTprovider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String userId = null;
        String email = null;
        String jwt = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            log.debug("Received JWT Token: {}", jwt);

            try {
                if (!jwtProvider.validateAccessToken(jwt)) {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.getWriter().write("Invalid token");
                    return;
                }

                userId = getClaimOrNull(jwt, "idUser");
                email = getClaimOrNull(jwt, "email");
            } catch (ExpiredJwtException e) {
                log.debug("Token expired");
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.getWriter().write("Token expired");
                return;
            } catch (SignatureException e) {
                log.debug("Invalid token signature");
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.getWriter().write("Invalid token signature");
                return;
            } catch (Exception e) {
                log.debug("Invalid token: general error");
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.getWriter().write("Invalid token");
                return;
            }
        }

        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Object rolesObject = jwtProvider.getAccessClaims(jwt).get("role");
            List<String> roles;

            if (rolesObject instanceof List<?>) {
                roles = ((List<?>) rolesObject).stream()
                        .map(role -> role.toString())
                        .collect(Collectors.toList());
            } else {
                roles = List.of();
            }

            UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                    userId,
                    email,
                    roles.stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList())
            );

            SecurityContextHolder.getContext().setAuthentication(token);
        }

        filterChain.doFilter(request, response);
    }

    private String getClaimOrNull(String jwt, String claimKey) {
        Object claimValue = jwtProvider.getAccessClaims(jwt).get(claimKey);
        return claimValue != null ? claimValue.toString() : null;
    }
}
