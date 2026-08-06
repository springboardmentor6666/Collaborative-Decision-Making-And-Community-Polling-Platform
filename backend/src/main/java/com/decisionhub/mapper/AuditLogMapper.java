package com.decisionhub.mapper;

import com.decisionhub.dto.response.AuditLogResponse;
import com.decisionhub.entity.AuditLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface AuditLogMapper {

    AuditLogResponse toResponse(AuditLog auditLog);
}
