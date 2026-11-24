package com.lms_poltekcwe.lms_backend.repository;

import com.lms_poltekcwe.lms_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u WHERE u.usernameOrNimNidn = :identity")
    Optional<User> findByUsernameOrNimNidn(@Param("identity") String usernameOrNimNidn);

    Optional<User> findByEmail(String email);
}