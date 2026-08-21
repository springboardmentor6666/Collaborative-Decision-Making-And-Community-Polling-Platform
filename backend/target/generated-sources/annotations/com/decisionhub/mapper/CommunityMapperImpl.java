package com.decisionhub.mapper;

import com.decisionhub.dto.request.CommunityRequest;
import com.decisionhub.dto.response.CommunityResponse;
import com.decisionhub.entity.Community;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-21T18:15:53+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class CommunityMapperImpl implements CommunityMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public CommunityResponse toResponse(Community community) {
        if ( community == null ) {
            return null;
        }

        CommunityResponse.CommunityResponseBuilder communityResponse = CommunityResponse.builder();

        communityResponse.owner( userMapper.toResponse( community.getOwner() ) );
        communityResponse.communityId( community.getCommunityId() );
        communityResponse.createdAt( community.getCreatedAt() );
        communityResponse.description( community.getDescription() );
        communityResponse.image( community.getImage() );
        communityResponse.name( community.getName() );
        communityResponse.visibility( community.getVisibility() );

        return communityResponse.build();
    }

    @Override
    public Community toEntity(CommunityRequest request) {
        if ( request == null ) {
            return null;
        }

        Community.CommunityBuilder community = Community.builder();

        community.description( request.getDescription() );
        community.image( request.getImage() );
        community.name( request.getName() );
        community.visibility( request.getVisibility() );

        return community.build();
    }
}
