package com.decisionhub.dto.response;

import com.decisionhub.common.enums.MemberRole;
import com.decisionhub.common.enums.MemberStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityMemberResponse {

    private Long memberId;
    private Long communityId;
    private UserResponse user;
    private MemberRole memberRole;
    private MemberStatus status;
    private LocalDateTime joinedAt;
}
