package graph.ecommerance.resource;

import graph.ecommerance.dto.ReviewRequest;
import graph.ecommerance.entity.Review;
import graph.ecommerance.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ReviewResource {

    private final ReviewService reviewService;

    @MutationMapping
    public Review leaveReview(@Valid @Argument ReviewRequest request) {
        return reviewService.leaveReview(request);
    }
}
