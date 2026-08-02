package com.decisionhub.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by_id")
    private User generatedBy;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String data;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Report() {
    }

    public Report(String title, User generatedBy, String data) {
        this.title = title;
        this.generatedBy = generatedBy;
        this.data = data;
    }

    public Report(Long id, String title, User generatedBy, String data) {
        this.id = id;
        this.title = title;
        this.generatedBy = generatedBy;
        this.data = data;
    }

    // Custom Builder
    public static ReportBuilder builder() {
        return new ReportBuilder();
    }

    public static class ReportBuilder {
        private Long id;
        private String title;
        private User generatedBy;
        private String data;

        public ReportBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ReportBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ReportBuilder generatedBy(User generatedBy) {
            this.generatedBy = generatedBy;
            return this;
        }

        public ReportBuilder data(String data) {
            this.data = data;
            return this;
        }

        public Report build() {
            return new Report(id, title, generatedBy, data);
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public User getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(User generatedBy) {
        this.generatedBy = generatedBy;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
