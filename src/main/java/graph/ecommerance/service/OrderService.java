package graph.ecommerance.service;

import graph.ecommerance.dto.OrderRequest;
import graph.ecommerance.entity.Order;
import graph.ecommerance.entity.OrderItem;
import graph.ecommerance.entity.Product;
import graph.ecommerance.entity.User;
import graph.ecommerance.repository.OrderRepository;
import graph.ecommerance.repository.ProductRepository;
import graph.ecommerance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Buyurtma topilmadi!"));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order placeOrder(OrderRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("Foydalanuvchi topilmadi!"));

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");
        
        List<OrderItem> items = new ArrayList<>();
        double totalAmount = 0.0;

        for (var itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new RuntimeException("Mahsulot topilmadi: " + itemReq.productId()));

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setOrder(order);
            item.setQuantity(itemReq.quantity());
            
            // Muhim: Aynan buyurtma paytidagi narxni qulflaymiz!
            item.setPriceAtPurchase(product.getPrice());
            
            totalAmount += (product.getPrice() * itemReq.quantity());
            items.add(item);
        }

        order.setItems(items);
        order.setTotalAmount(totalAmount);
        
        // Mock Stripe Payment Integration
        if (request.creditCardNumber() != null && request.creditCardNumber().length() >= 16) {
            System.out.println("Processing payment via Stripe mock... Card: " + request.creditCardNumber());
            // Simulate API delay
            try { Thread.sleep(1000); } catch (InterruptedException e) {}
            order.setStatus("PAID");
        } else {
            order.setStatus("PENDING");
        }

        return orderRepository.save(order);
    }
}
