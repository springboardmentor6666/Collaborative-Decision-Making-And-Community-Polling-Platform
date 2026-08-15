package com.decisionhub.service;

import com.decisionhub.entity.Category;
import com.decisionhub.repository.CategoryRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @PostConstruct
    @Transactional
    public void seedDefaultCategories() {
        if (categoryRepository.count() == 0) {
            List<String> defaultNames = Arrays.asList(
                    "Technology & Engineering",
                    "Governance & Policy",
                    "Product & Design",
                    "Finance & Budget",
                    "Operations & Strategy",
                    "Community & Culture",
                    "Other"
            );
            for (String name : defaultNames) {
                if (!categoryRepository.existsByName(name)) {
                    categoryRepository.save(new Category(null, name));
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        seedDefaultCategories();
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    @Transactional
    public Category createCategory(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
        String cleanName = name.trim();
        return categoryRepository.findByName(cleanName)
                .orElseGet(() -> categoryRepository.save(new Category(null, cleanName)));
    }
}

