package com.decisionhub.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

 @ExceptionHandler(MethodArgumentNotValidException.class)
 @ResponseStatus(HttpStatus.BAD_REQUEST)
 Map<String, String> validation(
         MethodArgumentNotValidException e
 ) {

  return Map.of(
          "message",
          e.getBindingResult()
                  .getFieldErrors()
                  .stream()
                  .findFirst()
                  .map(x -> x.getDefaultMessage())
                  .orElse("Invalid request")
  );
 }


 @ExceptionHandler(AccessDeniedException.class)
 @ResponseStatus(HttpStatus.FORBIDDEN)
 Map<String, String> denied(
         AccessDeniedException e
 ) {

  return Map.of(
          "message",
          e.getMessage()
  );
 }


 @ExceptionHandler(
         java.util.NoSuchElementException.class
 )
 @ResponseStatus(HttpStatus.NOT_FOUND)
 Map<String, String> missing(
         java.util.NoSuchElementException e
 ) {

  return Map.of(
          "message",
          e.getMessage()
  );
 }


 @ExceptionHandler(
         org.springframework.dao.DataIntegrityViolationException.class
 )
 @ResponseStatus(HttpStatus.CONFLICT)
 Map<String, String> integrity(
         org.springframework.dao.DataIntegrityViolationException e
 ) {

  return Map.of(
          "message",
          "This record can't be deleted because it still has related data (decisions, votes, or communities) attached to it."
  );
 }


 @ExceptionHandler(IllegalStateException.class)
 @ResponseStatus(HttpStatus.CONFLICT)
 Map<String, String> conflict(
         IllegalStateException e
 ) {

  return Map.of(
          "message",
          e.getMessage()
  );
 }


 @ExceptionHandler(RuntimeException.class)
 @ResponseStatus(HttpStatus.BAD_REQUEST)
 Map<String, String> business(
         RuntimeException e
 ) {

  return Map.of(
          "message",
          e.getMessage() == null
                  ? "Request could not be completed"
                  : e.getMessage()
  );
 }
}