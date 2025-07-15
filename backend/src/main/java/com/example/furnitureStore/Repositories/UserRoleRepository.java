package com.example.furnitureStore.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import com.example.furnitureStore.Entities.UserRole;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    @Query("SELECT ur.userId FROM UserRole ur WHERE ur.roleId = :roleId")
    List<Long> findUserIdsByRoleId(Integer roleId);
}
