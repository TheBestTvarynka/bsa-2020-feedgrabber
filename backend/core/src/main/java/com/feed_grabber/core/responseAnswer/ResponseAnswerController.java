package com.feed_grabber.core.responseAnswer;

import com.feed_grabber.core.exceptions.AlreadyExistsException;
import com.feed_grabber.core.question.exceptions.QuestionNotFoundException;
import com.feed_grabber.core.questionnaireResponse.exceptions.QuestionnaireResponseNotFoundException;
import com.feed_grabber.core.response.AppResponse;
import com.feed_grabber.core.responseAnswer.dto.ResponseAnswerCreateDto;
import com.feed_grabber.core.responseAnswer.dto.ResponseAnswerDto;
import com.feed_grabber.core.responseAnswer.exceptions.ResponseAnswerNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/answers")
public class ResponseAnswerController {

    private final ResponseAnswerService answerService;

    @Autowired
    public ResponseAnswerController(ResponseAnswerService answerService) {
        this.answerService = answerService;
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public AppResponse<List<ResponseAnswerDto>> getAll() {
        return new AppResponse<>(
                answerService.getAll()
        );
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public AppResponse<ResponseAnswerDto> getOne(@PathVariable UUID id)
            throws ResponseAnswerNotFoundException {
        return new AppResponse<>(
                answerService.getOne(id).orElseThrow(ResponseAnswerNotFoundException::new)
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppResponse<ResponseAnswerDto> create(@RequestBody ResponseAnswerCreateDto createDto)
            throws AlreadyExistsException, QuestionnaireResponseNotFoundException, QuestionNotFoundException {
        return new AppResponse<>(
                answerService.create(createDto)
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        answerService.delete(id);
    }
}