package graph.ecommerance.service;

import graph.ecommerance.dto.ProductRequest;
import graph.ecommerance.entity.Category;
import graph.ecommerance.entity.Product;
import graph.ecommerance.repository.CategoryRepository;
import graph.ecommerance.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public List<Product> getAllProducts(int page, int size) {
        return productRepository.findAll(PageRequest.of(page, size)).getContent();
    }
    
    public List<Product> searchProducts(String title, Long categoryId, Double minPrice, Double maxPrice, int page, int size) {
        String safeTitle = (title == null) ? "" : title;
        return productRepository.searchProducts(safeTitle, categoryId, minPrice, maxPrice, PageRequest.of(page, size)).getContent();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = new Product();
        product.setTitle(request.title());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());
        product.setCategory(category);

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        product.setTitle(request.title());
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());
        product.setCategory(category);

        return productRepository.save(product);
    }

    public String deleteProduct(Long id) {
        productRepository.deleteById(id);
        return "Product deleted successfully";
    }
}
