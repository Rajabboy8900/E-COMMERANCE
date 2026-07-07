package graph.ecommerance.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRequest(
        @NotBlank(message = "Ism bo'sh bo'lishi mumkin emas!")
        String fullName,
        
        @Email(message = "Noto'g'ri email formati!")
        @NotBlank(message = "Email kiritilishi shart!")
        String email,
        
        @NotBlank(message = "Parol kiritilishi shart!")
        @Size(min = 6, message = "Parol kamida 6 belgidan iborat bo'lishi kerak!")
        String password
) {
}
