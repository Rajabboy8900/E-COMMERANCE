package graph.ecommerance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;

public record ProductRequest(
        @NotBlank(message = "Mahsulot nomi bo'sh bo'lishi mumkin emas!")
        String title,
        
        @NotNull(message = "Narx kiritilishi shart!")
        @Positive(message = "Narx manfiy yoki nol bo'lishi mumkin emas!")
        Double price,
        
        @NotNull(message = "Kategoriya ID kiritilishi shart!")
        Long categoryId
) {
}
