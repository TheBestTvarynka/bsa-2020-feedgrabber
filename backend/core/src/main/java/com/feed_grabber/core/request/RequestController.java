package com.feed_grabber.core.request;

import com.feed_grabber.core.auth.security.TokenService;
import com.feed_grabber.core.exceptions.NotFoundException;
import com.feed_grabber.core.questionCategory.exceptions.QuestionCategoryNotFoundException;
import com.feed_grabber.core.request.dto.CreateRequestDto;
import com.feed_grabber.core.apiContract.AppResponse;
import com.feed_grabber.core.request.dto.PendingRequestDto;
import com.feed_grabber.core.request.dto.RequestQuestionnaireDto;
import com.feed_grabber.core.user.exceptions.UserNotFoundException;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/request")
public class RequestController {
    @Autowired
    RequestService requestService;

    @PostMapping("/new")
    @ResponseStatus(HttpStatus.OK)
    public AppResponse<UUID> createNewRequest(@RequestBody CreateRequestDto dto)
            throws UserNotFoundException, QuestionCategoryNotFoundException {
        return new AppResponse<>(requestService.createNew(dto));
    }

    // Force close feature
    @PostMapping("/close")
    @ResponseStatus(HttpStatus.OK)
    public AppResponse<Date> closeRequest(@RequestBody UUID requestId)
            throws NotFoundException {
        return new AppResponse<>(requestService.closeNow(requestId));
    }

    @GetMapping("/pending")
    @ResponseStatus(HttpStatus.OK)
    public AppResponse<List<PendingRequestDto>> getPending() {
        return new AppResponse<>(requestService.getPending(TokenService.getUserId()));
    }

    // @ApiOperation("Get all respondent`s requests with questionnaires")
    // @GetMapping("/respondent")
    // @ResponseStatus(HttpStatus.OK)
    // public AppResponse<List<RequestQuestionnaireDto>> getAllByRespondentId(Principal principal) {
    //     return new AppResponse<>(
    //             requestService.getAllByUserId(UUID.fromString(principal.getName()))
    //     );
    // }
}
