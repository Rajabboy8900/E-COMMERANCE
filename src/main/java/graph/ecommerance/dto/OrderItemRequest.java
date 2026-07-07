package graph.ecommerance.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OrderItemRequest(
        @NotNull(message = "Mahsulot ID kiritilishi shart!")
        Long productId,

        @NotNull(message = "Miqdor kiritilishi shart!")
        @Min(value = 1, message = "Kamida 1 ta mahsulot buyurtma qilish kerak!")
        Integer quantity
) {
}
