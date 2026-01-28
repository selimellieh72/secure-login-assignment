package com.selimellieh.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.selimellieh.backend.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);
}

