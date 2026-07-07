package graph.ecommerance.service;

import graph.ecommerance.dto.UserRequest;
import graph.ecommerance.entity.Role;
import graph.ecommerance.entity.User;
import graph.ecommerance.repository.UserRepository;
import graph.ecommerance.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Foydalanuvchi topilmadi!"));
    }

    public User registerUser(UserRequest request) {
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        
        // Agar birinchi user bo'lsa, uni ADMIN qilamiz (test uchun qulay)
        if (userRepository.count() == 0) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }
        
        return userRepository.save(user);
    }
    
    public String login(String email, String password) {
        // We will do simple custom authentication here instead of Spring Security AuthenticationManager 
        // to keep GraphQL integration simple.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email topilmadi!"));
                
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Noto'g'ri parol!");
        }
        
        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }
}
