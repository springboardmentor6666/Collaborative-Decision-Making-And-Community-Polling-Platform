package com.decisionhub.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditableEntity {

    @CreatedBy
    @Column(name = "created_by_user", updatable = false)
    private String createdByUser;

    @CreatedDate
    @Column(name = "created_at_audit", updatable = false)
    private LocalDateTime createdAtAudit;

    @LastModifiedBy
    @Column(name = "last_modified_by_user")
    private String lastModifiedByUser;

    @LastModifiedDate
    @Column(name = "last_modified_at_audit")
    private LocalDateTime lastModifiedAtAudit;

    public String getCreatedByUser() {
        return createdByUser;
    }

    public void setCreatedByUser(String createdByUser) {
        this.createdByUser = createdByUser;
    }

    public LocalDateTime getCreatedAtAudit() {
        return createdAtAudit;
    }

    public void setCreatedAtAudit(LocalDateTime createdAtAudit) {
        this.createdAtAudit = createdAtAudit;
    }

    public String getLastModifiedByUser() {
        return lastModifiedByUser;
    }

    public void setLastModifiedByUser(String lastModifiedByUser) {
        this.lastModifiedByUser = lastModifiedByUser;
    }

    public LocalDateTime getLastModifiedAtAudit() {
        return lastModifiedAtAudit;
    }

    public void setLastModifiedAtAudit(LocalDateTime lastModifiedAtAudit) {
        this.lastModifiedAtAudit = lastModifiedAtAudit;
    }
}
