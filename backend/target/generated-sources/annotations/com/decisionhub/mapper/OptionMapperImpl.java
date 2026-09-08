package com.decisionhub.mapper;

import com.decisionhub.dto.request.OptionRequest;
import com.decisionhub.dto.response.OptionResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-09-08T18:19:01+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260826-1225, environment: Java 21.0.12.1 (Eclipse Adoptium)"
)
@Component
public class OptionMapperImpl implements OptionMapper {

    @Override
    public OptionResponse toResponse(Option option) {
        if ( option == null ) {
            return null;
        }

        OptionResponse.OptionResponseBuilder optionResponse = OptionResponse.builder();

        optionResponse.decisionId( optionDecisionDecisionId( option ) );
        optionResponse.createdAt( option.getCreatedAt() );
        optionResponse.description( option.getDescription() );
        optionResponse.optionId( option.getOptionId() );
        optionResponse.title( option.getTitle() );
        optionResponse.totalScore( option.getTotalScore() );

        return optionResponse.build();
    }

    @Override
    public Option toEntity(OptionRequest request) {
        if ( request == null ) {
            return null;
        }

        Option.OptionBuilder option = Option.builder();

        option.description( request.getDescription() );
        option.title( request.getTitle() );

        return option.build();
    }

    private Long optionDecisionDecisionId(Option option) {
        if ( option == null ) {
            return null;
        }
        Decision decision = option.getDecision();
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
