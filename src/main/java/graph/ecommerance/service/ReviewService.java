package graph.ecommerance.service;

import graph.ecommerance.dto.ReviewRequest;
import graph.ecommerance.entity.Product;
import graph.ecommerance.entity.Review;
import graph.ecommerance.entity.User;
import graph.ecommerance.repository.ProductRepository;
import graph.ecommerance.repository.ReviewRepository;
import graph.ecommerance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Review leaveReview(ReviewRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Mahsulot topilmadi!"));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("Foydalanuvchi topilmadi!"));

        Review review = new Review();
        review.setComment(request.comment());
        review.setRating(request.rating());
        review.setProduct(product);
        review.setUser(user);

        return reviewRepository.save(review);
    }
}
