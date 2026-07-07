package graph.ecommerance.resource;

import graph.ecommerance.entity.Category;
import graph.ecommerance.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class CategoryResource {

    private final CategoryService categoryService;

    @QueryMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @MutationMapping
    public Category createCategory(@Argument String name) {
        return categoryService.createCategory(name);
    }
}