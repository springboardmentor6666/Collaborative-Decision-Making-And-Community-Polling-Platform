package com.decisionhub.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
