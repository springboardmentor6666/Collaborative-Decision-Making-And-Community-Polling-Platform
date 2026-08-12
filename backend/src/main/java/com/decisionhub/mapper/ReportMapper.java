package com.decisionhub.mapper;

import com.decisionhub.dto.response.ReportResponse;
import com.decisionhub.entity.Report;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ReportMapper {

    @Mapping(target = "decisionId", source = "decision.decisionId")
    @Mapping(target = "generatedBy", source = "generatedBy")
    @Mapping(target = "generatedAt", source = "createdAt")
    ReportResponse toResponse(Report report);
}
