package com.decisionhub.dto;

public class ImpressionRequest {

    private String type;

    public ImpressionRequest() {
    }

    public ImpressionRequest(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
