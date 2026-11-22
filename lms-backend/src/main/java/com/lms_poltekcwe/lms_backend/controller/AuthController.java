@PostMapping("/google")
public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> payload) {
    String idTokenString = payload.get("token");
    String clientId = "1047565775377-80ir3b1bb1n8r7th3ch8ht9j1nuv1di7.apps.googleusercontent.com";

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

        // 1. Cek domain email dan tentukan role secara otomatis
        String detectedRole;
        if (email.endsWith("@mhs.cwe.ac.id")) {
            detectedRole = "mahasiswa";
        } else if (email.endsWith("@dosen.cwe.ac.id") || email.endsWith("@cwe.ac.id")) {
            // Sesuaikan "@dosen.cwe.ac.id" atau "@cwe.ac.id" dengan domain email dosen POLTEK CWE
            detectedRole = "dosen";
        } else {
            // Tolak jika bukan email kampus
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Akses ditolak! Gunakan email institusi (@mhs.cwe.ac.id atau @dosen.cwe.ac.id)."));
        }

        // 2. Cek ke database MariaDB; jika belum ada, otomatis buatkan akun sesuai role
        final String finalRole = detectedRole;
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(email.split("@")[0]);
            newUser.setNamaLengkap(name); // sesuaikan dengan setter nama di Entity User Anda
            newUser.setRole(finalRole);
            return userRepository.save(newUser);
        });

        // Pastikan role pada response sesuai domain email
        user.setRole(finalRole);
        return ResponseEntity.ok(user);

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Terjadi kesalahan server: " + e.getMessage()));
    }
}
