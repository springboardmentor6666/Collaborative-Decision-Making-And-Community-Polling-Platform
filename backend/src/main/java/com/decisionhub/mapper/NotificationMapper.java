package com.decisionhub.mapper;

import com.decisionhub.dto.response.NotificationResponse;
import com.decisionhub.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationResponse toResponse(Notification notification);
}
