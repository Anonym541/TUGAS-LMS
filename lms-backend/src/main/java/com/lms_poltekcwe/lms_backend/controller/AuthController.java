package com.lms_poltekcwe.lms_backend.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.lms_poltekcwe.lms_backend.entity.User;
import com.lms_poltekcwe.lms_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.lms_poltekcwe.lms_backend.entity.User;

import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // --- JANGAN HAPUS @PostMapping("/login") MANUAL KAMU DI SINI ---
    // Biarkan method login() yang sudah ada sebelumnya tetap di dalam class ini.

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> payload) {
        String idTokenString = payload.get("token");
        String clientId = "1047565775377-80ir3b1bb1n8r7th3ch8ht9j1nuv1di7.apps.googleusercontent.com";

        if (idTokenString == null || idTokenString.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Token Google tidak ditemukan dalam request."));
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Token Google tidak valid."));
            }

            GoogleIdToken.Payload googlePayload = idToken.getPayload();
            String email = googlePayload.getEmail().toLowerCase().trim();
            String name = (String) googlePayload.get("name");

            // 1. Cek domain email dan tentukan role (sesuai ENUM di database)
            String detectedRole;
            if (email.endsWith("@mhs.cwe.ac.id") || email.endsWith("@student.poltekcwe.ac.id") || email.equals("pebriansyaherwin@gmail.com")) {
                detectedRole = "MAHASISWA";
            } else if (email.endsWith("@dosen.cwe.ac.id") || email.endsWith("@cwe.ac.id") || email.endsWith("@poltekcwe.ac.id")) {
                detectedRole = "DOSEN";
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Akses ditolak! Gunakan email institusi POLTEK CWE."));
            }

            // 2. Cek ke database TiDB Cloud; jika belum ada, otomatis buatkan akun
            final String finalRole = detectedRole;
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsernameOrNimNidn(email.split("@")[0]);
                newUser.setNamaLengkap(name != null ? name : email.split("@")[0]);
                newUser.setPasswordHash("GOOGLE_OAUTH_" + UUID.randomUUID());
                newUser.setRole(finalRole);
                newUser.setIsActive(true);
                return userRepository.save(newUser);
            });

            return ResponseEntity.ok(user);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Terjadi kesalahan server: " + e.getMessage()));
        }
    }
}