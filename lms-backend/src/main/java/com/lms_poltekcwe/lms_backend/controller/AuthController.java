package com.lms_poltekcwe.lms_backend.controller;

import com.lms_poltekcwe.lms_backend.entity.User;
import com.lms_poltekcwe.lms_backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username/NIM dan password wajib diisi"));
        }

        Optional<User> userOpt = userRepository.findByUsernameOrNimNidn(username.trim());
        if (userOpt.isEmpty() || !userOpt.get().getPasswordHash().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Username/NIM atau password salah"));
        }

        User user = userOpt.get();
        if (Boolean.FALSE.equals(user.getIsActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Akun dinonaktifkan"));
        }

        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsernameOrNimNidn(),
            "namaLengkap", user.getNamaLengkap(),
            "email", user.getEmail(),
            "role", user.getRole()
        ));
    }
}
