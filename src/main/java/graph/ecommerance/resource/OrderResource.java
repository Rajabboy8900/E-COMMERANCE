package graph.ecommerance.resource;

import graph.ecommerance.dto.OrderRequest;
import graph.ecommerance.entity.Order;
import graph.ecommerance.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class OrderResource {

    private final OrderService orderService;

    @QueryMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @QueryMapping
    public Order getOrderById(@Argument Long id) {
        return orderService.getOrderById(id);
    }

    @MutationMapping
    public Order placeOrder(@Valid @Argument OrderRequest request) {
        return orderService.placeOrder(request);
    }
}
