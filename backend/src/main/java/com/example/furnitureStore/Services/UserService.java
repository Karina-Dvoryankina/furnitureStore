package com.example.furnitureStore.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.furnitureStore.Entities.Role;
import com.example.furnitureStore.Entities.User;
import com.example.furnitureStore.Repositories.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Consumer;
import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.furnitureStore.DTO.RecipientInfoDTO;
import com.example.furnitureStore.DTO.RegistrationUserDTO;
import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor

public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RoleService roleService;


    public Optional<User> findByUsername(String username) {
        return userRepository.findByEmail(username);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(
                String.format("Пользователь '%s' не найден", username)
        ));

        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().toString()));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }

    @Transactional
    public User createNewUser(RegistrationUserDTO registrationUserDto) {
        User user = new User();
        user.setFirstName(registrationUserDto.getFirstName());
        user.setLastName(registrationUserDto.getLastName());
        user.setPhoneNumber(registrationUserDto.getPhoneNumber());
        user.setEmail(registrationUserDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationUserDto.getPassword()));

        // Получаем роль
        Optional<Role> roleOptional = roleService.getUserRole(registrationUserDto.getRole());
        if (roleOptional.isEmpty()) {
            // Если роль не найдена, можно выбросить исключение или создать роль по умолчанию
            throw new RuntimeException("Роль не найдена: " + registrationUserDto.getRole());
        }

        // Устанавливаем роль
        user.setRole(List.of(roleOptional.get()));
        
        return userRepository.save(user);
    }

    public User saveUpdateUser(User user) {   
        return userRepository.save(user); 
    }

    public User findById(Long idUser) {
        return userRepository.findById(idUser).get();
    }

    public Optional<User> findByEmail(String username) {
        return userRepository.findByEmail(username);
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден: " + userId));
    }

    public void updateUserAddressById(Long userId, String address) {
        User user = getUserById(userId);
        user.setDeliveryAddress(address);
        userRepository.save(user);
    }

    public void clearUserAddress(Long userId) {
        User user = getUserById(userId);
        user.setDeliveryAddress(null); 
        userRepository.save(user);
    }

    public ResponseEntity<Map<String, String>> handleAddressOperation(Principal principal, Consumer<Long> addressOperation) {
        try {
            String userId = principal.getName();
            addressOperation.accept(Long.valueOf(userId));
            return ResponseEntity.ok(Collections.singletonMap("status", "success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    public RecipientInfoDTO getRecipientInfo(Long userId) {
    User user = getUserById(userId);
    return new RecipientInfoDTO(
        user.getFirstName(),
        user.getLastName(),
        user.getPhoneNumber(),
        user.getDeliveryAddress()
    );
}

    
}
