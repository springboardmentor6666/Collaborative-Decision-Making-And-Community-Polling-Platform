package com.decisionhub.mapper;

import com.decisionhub.dto.request.DecisionRequest;
import com.decisionhub.dto.response.DecisionResponse;
import com.decisionhub.dto.response.OptionResponse;
import com.decisionhub.entity.Decision;
import com.decisionhub.entity.Option;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-11T20:45:37+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class DecisionMapperImpl implements DecisionMapper {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private CommunityMapper communityMapper;
    @Autowired
    private OptionMapper optionMapper;

    @Override
    public DecisionResponse toResponse(Decision decision) {
        if ( decision == null ) {
            return null;
        }

        DecisionResponse.DecisionResponseBuilder decisionResponse = DecisionResponse.builder();

        decisionResponse.createdBy( userMapper.toResponse( decision.getCreatedBy() ) );
        decisionResponse.community( communityMapper.toResponse( decision.getCommunity() ) );
        decisionResponse.options( optionListToOptionResponseList( decision.getOptions() ) );
        decisionResponse.allowAnonymousVote( decision.isAllowAnonymousVote() );
        decisionResponse.createdAt( decision.getCreatedAt() );
        decisionResponse.deadline( decision.getDeadline() );
        decisionResponse.decisionId( decision.getDecisionId() );
        decisionResponse.description( decision.getDescription() );
        decisionResponse.likeCount( decision.getLikeCount() );
        decisionResponse.shareCount( decision.getShareCount() );
        decisionResponse.status( decision.getStatus() );
        decisionResponse.title( decision.getTitle() );
        decisionResponse.updatedAt( decision.getUpdatedAt() );
        decisionResponse.viewCount( decision.getViewCount() );
        decisionResponse.visibility( decision.getVisibility() );
        decisionResponse.voteType( decision.getVoteType() );

        return decisionResponse.build();
    }

    @Override
    public Decision toEntity(DecisionRequest request) {
        if ( request == null ) {
            return null;
        }

        Decision.DecisionBuilder decision = Decision.builder();

        if ( request.getAllowAnonymousVote() != null ) {
            decision.allowAnonymousVote( request.getAllowAnonymousVote() );
        }
        decision.deadline( request.getDeadline() );
        decision.description( request.getDescription() );
        decision.title( request.getTitle() );
        decision.visibility( request.getVisibility() );
        decision.voteType( request.getVoteType() );

        return decision.build();
    }

    protected List<OptionResponse> optionListToOptionResponseList(List<Option> list) {
        if ( list == null ) {
            return null;
        }

        List<OptionResponse> list1 = new ArrayList<OptionResponse>( list.size() );
        for ( Option option : list ) {
            list1.add( optionMapper.toResponse( option ) );
        }

        return list1;
    }
}
