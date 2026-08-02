package com.decisionhub.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "options")
public class Option {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_id", nullable = false)
    private Decision decision;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String pros;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String cons;

    // Constructors
    public Option() {
    }

    public Option(Decision decision, String name, String description, String pros, String cons) {
        this.decision = decision;
        this.name = name;
        this.description = description;
        this.pros = pros;
        this.cons = cons;
    }

    public Option(Long id, Decision decision, String name, String description, String pros, String cons) {
        this.id = id;
        this.decision = decision;
        this.name = name;
        this.description = description;
        this.pros = pros;
        this.cons = cons;
    }

    // Custom Builder
    public static OptionBuilder builder() {
        return new OptionBuilder();
    }

    public static class OptionBuilder {
        private Long id;
        private Decision decision;
        private String name;
        private String description;
        private String pros;
        private String cons;

        public OptionBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public OptionBuilder decision(Decision decision) {
            this.decision = decision;
            return this;
        }

        public OptionBuilder name(String name) {
            this.name = name;
            return this;
        }

        public OptionBuilder description(String description) {
            this.description = description;
            return this;
        }

        public OptionBuilder pros(String pros) {
            this.pros = pros;
            return this;
        }

        public OptionBuilder cons(String cons) {
            this.cons = cons;
            return this;
        }

        public Option build() {
            return new Option(id, decision, name, description, pros, cons);
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Decision getDecision() {
        return decision;
    }

    public void setDecision(Decision decision) {
        this.decision = decision;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPros() {
        return pros;
    }

    public void setPros(String pros) {
        this.pros = pros;
    }

    public String getCons() {
        return cons;
    }

    public void setCons(String cons) {
        this.cons = cons;
    }
}
