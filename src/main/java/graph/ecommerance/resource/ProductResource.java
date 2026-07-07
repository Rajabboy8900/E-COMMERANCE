package graph.ecommerance.resource;

import graph.ecommerance.dto.ProductRequest;
import graph.ecommerance.entity.Product;
import graph.ecommerance.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ProductResource {

    private final ProductService productService;

    @QueryMapping
    public List<Product> getAllProducts(@Argument Integer page, @Argument Integer size) {
        int pageNumber = page != null ? page : 0;
        int pageSize = size != null ? size : 10;
        return productService.getAllProducts(pageNumber, pageSize);
    }

    @QueryMapping
    public Product getProductById(@Argument Long id) {
        return productService.getProductById(id);
    }

    @MutationMapping
    public Product createProduct(@Valid @Argument ProductRequest request) {
        return productService.createProduct(request);
    }

    @MutationMapping
    public Product updateProduct(@Argument Long id, @Valid @Argument ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @MutationMapping
    public String deleteProduct(@Argument Long id) {
        return productService.deleteProduct(id);
    }
}