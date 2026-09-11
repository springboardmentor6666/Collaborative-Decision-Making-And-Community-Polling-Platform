package com.decisionhub.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HikeResponse {
    private Long decisionId;
    @JsonProperty("isHiked")
    private boolean isHiked;
    private int hikeCount;

    public boolean isHiked() {
        return isHiked;
    }

    public void setHiked(boolean isHiked) {
        this.isHiked = isHiked;
    }
}
