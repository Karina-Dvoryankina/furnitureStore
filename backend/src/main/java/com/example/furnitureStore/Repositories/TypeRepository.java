package com.example.furnitureStore.Repositories;

import com.example.furnitureStore.Entities.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TypeRepository extends JpaRepository<Type, Long> {

    @Query("SELECT t FROM Type t WHERE t.name = :categoryName")
    Type findByName(@Param("categoryName") String categoryName);

}
