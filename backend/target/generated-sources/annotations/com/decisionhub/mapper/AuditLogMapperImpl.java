package com.decisionhub.mapper;

import com.decisionhub.dto.response.AuditLogResponse;
import com.decisionhub.entity.AuditLog;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-12T16:06:02+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class AuditLogMapperImpl implements AuditLogMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public AuditLogResponse toResponse(AuditLog auditLog) {
        if ( auditLog == null ) {
            return null;
        }

        AuditLogResponse.AuditLogResponseBuilder auditLogResponse = AuditLogResponse.builder();

        auditLogResponse.action( auditLog.getAction() );
        auditLogResponse.createdAt( auditLog.getCreatedAt() );
        auditLogResponse.entityId( auditLog.getEntityId() );
        auditLogResponse.entityType( auditLog.getEntityType() );
        auditLogResponse.ipAddress( auditLog.getIpAddress() );
        auditLogResponse.logId( auditLog.getLogId() );
        auditLogResponse.user( userMapper.toResponse( auditLog.getUser() ) );

        return auditLogResponse.build();
    }
}
