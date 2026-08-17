package com.decisionhub.controller;

import com.decisionhub.entity.Category;
import com.decisionhub.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "Endpoints for category taxonomy and user-made categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Get all categories", description = "Retrieves all standard and user-made categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Retrieves details of a specific category")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create user-made category", description = "Creates a new custom category or returns existing")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        Category created = categoryService.createCategory(name);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}

