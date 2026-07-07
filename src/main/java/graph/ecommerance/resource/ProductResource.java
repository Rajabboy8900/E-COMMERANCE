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
        return productService.getAllProducts(page != null ? page : 0, size != null ? size : 20);
    }
    
    @QueryMapping
    public List<Product> searchProducts(
            @Argument String title, 
            @Argument Long categoryId, 
            @Argument Double minPrice, 
            @Argument Double maxPrice, 
            @Argument Integer page, 
            @Argument Integer size) {
        return productService.searchProducts(title, categoryId, minPrice, maxPrice, page != null ? page : 0, size != null ? size : 20);
    }

    @QueryMapping
    public Product getProductById(@Argument Long id) {
        return productService.getProductById(id);
    }

    @MutationMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@Valid @Argument ProductRequest request) {
        return productService.createProduct(request);
    }

    @MutationMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public Product updateProduct(@Argument Long id, @Valid @Argument ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @MutationMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public String deleteProduct(@Argument Long id) {
        return productService.deleteProduct(id);
    }
}