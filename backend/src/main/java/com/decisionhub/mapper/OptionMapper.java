package com.decisionhub.mapper;

import com.decisionhub.dto.request.OptionRequest;
import com.decisionhub.dto.response.OptionResponse;
import com.decisionhub.entity.Option;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OptionMapper {

    @Mapping(target = "decisionId", source = "decision.decisionId")
    @Mapping(target = "voteCount", ignore = true)
    OptionResponse toResponse(Option option);

    @Mapping(target = "optionId", ignore = true)
    @Mapping(target = "decision", ignore = true)
    @Mapping(target = "totalScore", ignore = true)
    Option toEntity(OptionRequest request);
}
