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
        PageRequest pageRequest = PageRequest.of(page, size);
        return productRepository.findAll(pageRequest).getContent();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bunday ID ga ega mahsulot topilmadi!"));
    }

    public Product createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new RuntimeException("Kategoriya topilmadi!"));

        Product product = new Product();
        product.setTitle(request.title());
        product.setPrice(request.price());
        product.setCategory(category);

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("O'zgartirilishi kerak bo'lgan mahsulot topilmadi!"));
        
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new RuntimeException("Kategoriya topilmadi!"));

        product.setTitle(request.title());
        product.setPrice(request.price());
        product.setCategory(category);

        return productRepository.save(product);
    }

    public String deleteProduct(Long id) {
        productRepository.deleteById(id);
        return "Mahsulot muvaffaqiyatli o'chirildi!";
    }
}
