package graph.ecommerance.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import java.util.List;

public record OrderRequest(
        @NotNull(message = "Foydalanuvchi ID kiritilishi shart!")
        Long userId,

        @NotEmpty(message = "Buyurtmada kamida bitta mahsulot bo'lishi kerak!")
        @Valid
        List<OrderItemRequest> items,

        String creditCardNumber
) {
}
