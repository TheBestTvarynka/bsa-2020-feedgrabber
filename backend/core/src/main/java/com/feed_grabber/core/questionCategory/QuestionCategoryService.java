package com.feed_grabber.core.questionCategory;

import com.feed_grabber.core.company.CompanyRepository;
import com.feed_grabber.core.company.exceptions.CompanyNotFoundException;
import com.feed_grabber.core.questionCategory.dto.QuestionCategoryCreateDto;
import com.feed_grabber.core.questionCategory.dto.QuestionCategoryDto;
import com.feed_grabber.core.questionCategory.dto.QuestionCategoryUpdateDto;
import com.feed_grabber.core.questionCategory.exceptions.QuestionCategoryExistsException;
import com.feed_grabber.core.questionCategory.exceptions.QuestionCategoryNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuestionCategoryService {

    private final QuestionCategoryRepository questionCategoryRepository;
    private final CompanyRepository companyRepository;

    @Autowired
    public QuestionCategoryService(QuestionCategoryRepository questionCategoryRepository,
                                   CompanyRepository companyRepository) {
        this.questionCategoryRepository = questionCategoryRepository;
        this.companyRepository = companyRepository;
    }

    public List<QuestionCategoryDto> getAll() {
        return questionCategoryRepository.findAll()
                .stream()
                .map(QuestionCategoryMapper.MAPPER::questionCategoryToQuestionCategoryDto)
                .collect(Collectors.toList());
    }

    public List<QuestionCategoryDto> getAllByCompanyId(UUID companyId) {
        return questionCategoryRepository.findAllByCompanyId(companyId)
                .stream()
                .map(QuestionCategoryMapper.MAPPER::questionCategoryToQuestionCategoryDto)
                .collect(Collectors.toList());
    }

    public Optional<QuestionCategoryDto> getOne(UUID id) {
        return questionCategoryRepository.findById(id)
                .map(QuestionCategoryMapper.MAPPER::questionCategoryToQuestionCategoryDto);
    }

    public QuestionCategoryDto create(QuestionCategoryCreateDto createDto)
            throws CompanyNotFoundException, QuestionCategoryExistsException {

        var company = companyRepository.findById(createDto.getCompanyId())
                .orElseThrow(CompanyNotFoundException::new);

        if (questionCategoryRepository.existsByTitleAndCompanyId(createDto.getTitle(), createDto.getCompanyId())) {
            throw new QuestionCategoryExistsException();
        }

        var questionCategory = QuestionCategoryMapper.MAPPER.questionCategoryCreateDtoToModel(createDto, company);

        return QuestionCategoryMapper.MAPPER
                .questionCategoryToQuestionCategoryDto(questionCategoryRepository.save(questionCategory));
    }

    public QuestionCategoryDto update(QuestionCategoryUpdateDto updateDto)
            throws  QuestionCategoryExistsException, QuestionCategoryNotFoundException {

        var questionCategory = questionCategoryRepository.findById(updateDto.getId())
                .orElseThrow(QuestionCategoryNotFoundException::new);

        if (questionCategoryRepository.existsByTitleAndCompanyIdAndIdIsNot(updateDto.getTitle(), updateDto.getCompanyId(), updateDto.getId())) {
            throw new QuestionCategoryExistsException();
        }

        questionCategory.setTitle(updateDto.getTitle());

        return QuestionCategoryMapper.MAPPER
                .questionCategoryToQuestionCategoryDto(questionCategoryRepository.save(questionCategory));
    }

    public void delete(UUID id) {
        questionCategoryRepository.deleteById(id);
    }
}
