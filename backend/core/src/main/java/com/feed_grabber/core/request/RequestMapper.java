package com.feed_grabber.core.request;

import com.feed_grabber.core.questionnaire.QuestionnaireMapper;
import com.feed_grabber.core.questionnaire.model.Questionnaire;
import com.feed_grabber.core.request.dto.CreateRequestDto;
import com.feed_grabber.core.request.dto.PendingRequestDto;
import com.feed_grabber.core.request.dto.RequestQuestionnaireDto;
import com.feed_grabber.core.request.dto.RequestShortDto;
import com.feed_grabber.core.request.model.Request;
import com.feed_grabber.core.user.UserMapper;
import com.feed_grabber.core.user.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;
import java.util.Date;

@Mapper(uses = {QuestionnaireMapper.class, UserMapper.class})
public interface RequestMapper {
    RequestMapper MAPPER = Mappers.getMapper(RequestMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "creationDate", ignore = true)
    Request requestCreationRequestDtoToModel(CreateRequestDto dto,
                                             Questionnaire questionnaire,
                                             User targetUser,
                                             User requestMaker,
                                             Date expirationDate);

    @Mapping(target = "requestId", source = "request.id")
    @Mapping(target = "alreadyAnswered", expression = "java(request" +
            ".getResponses()" +
            ".stream()" +
            ".filter(r->r.getUser()" +
            ".getId().equals(userId))" +
            ".findAny()" +
            ".map(r->r.getPayload())" +
            ".isPresent())")
    PendingRequestDto toPendingDtoFromModel(Request request, UUID userId);

    @Mapping(target = "requestId", source = "request.id")
    RequestQuestionnaireDto requestAndQuestionnaireToDto(Request request, Questionnaire questionnaire);

    @Mapping(target = "requestId", source = "id")
    @Mapping(target = "userCount", expression = "java(request.getResponses().size())")
    RequestShortDto requestToShortDto(Request request);
}
