package com.decisionhub.mapper;

import com.decisionhub.dto.response.ReportResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Report;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-01T21:39:18+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class ReportMapperImpl implements ReportMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public ReportResponse toResponse(Report report) {
        if ( report == null ) {
            return null;
        }

        ReportResponse.ReportResponseBuilder reportResponse = ReportResponse.builder();

        reportResponse.decisionId( reportDecisionDecisionId( report ) );
        reportResponse.generatedBy( userMapper.toResponse( report.getGeneratedBy() ) );
        reportResponse.generatedAt( report.getCreatedAt() );
        reportResponse.reportId( report.getReportId() );
        reportResponse.reportType( report.getReportType() );
        reportResponse.reportUrl( report.getReportUrl() );

        return reportResponse.build();
    }

    private Long reportDecisionDecisionId(Report report) {
        if ( report == null ) {
            return null;
        }
        Decision decision = report.getDecision();
        if ( decision == null ) {
            return null;
        }
        Long decisionId = decision.getDecisionId();
        if ( decisionId == null ) {
            return null;
        }
        return decisionId;
    }
}
