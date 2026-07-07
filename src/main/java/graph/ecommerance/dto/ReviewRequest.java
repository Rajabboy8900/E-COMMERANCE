package graph.ecommerance.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReviewRequest(
        @NotBlank(message = "Izoh bo'sh bo'lishi mumkin emas!")
        String comment,

        @NotNull(message = "Baho kiritish shart!")
        @Min(value = 1, message = "Baho kamida 1 bo'lishi kerak")
        @Max(value = 5, message = "Baho ko'pi bilan 5 bo'lishi mumkin")
        Integer rating,

        @NotNull(message = "Mahsulot ID kiritilishi shart!")
        Long productId,

        @NotNull(message = "Foydalanuvchi ID kiritilishi shart!")
        Long userId
) {
}
