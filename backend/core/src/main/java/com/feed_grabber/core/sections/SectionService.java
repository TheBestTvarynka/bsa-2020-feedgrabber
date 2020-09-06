package com.feed_grabber.core.sections;

import com.feed_grabber.core.exceptions.NotFoundException;
import com.feed_grabber.core.question.QuestionMapper;
import com.feed_grabber.core.question.QuestionRepository;
import com.feed_grabber.core.question.dto.QuestionDto;
import com.feed_grabber.core.questionnaire.QuestionnaireRepository;
import com.feed_grabber.core.questionnaire.exceptions.QuestionnaireNotFoundException;
import com.feed_grabber.core.sections.dto.*;
import com.feed_grabber.core.sections.exception.SectionNotFoundException;
import com.feed_grabber.core.sections.model.Section;
import com.feed_grabber.core.sections.model.SectionQuestion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SectionService {
    private final SectionRepository sectionRepository;
    private final QuestionRepository questionRepository;
    private final QuestionnaireRepository questionnaireRepository;

    @Autowired
    public SectionService(SectionRepository sectionRepository,
                          QuestionRepository questionRepository,
                          QuestionnaireRepository questionnaireRepository) {
        this.sectionRepository = sectionRepository;
        this.questionRepository = questionRepository;
        this.questionnaireRepository = questionnaireRepository;
    }

    public SectionDto create(SectionCreateDto createDto) throws QuestionnaireNotFoundException {
        if (createDto.getTitle() == null) createDto.setTitle("New section");

        var questionnaire = questionnaireRepository.findById(createDto.getQuestionnaireId())
                .orElseThrow(QuestionnaireNotFoundException::new);

        var section = SectionMapper.MAPPER.createDtoToModel(createDto, questionnaire);
        return SectionMapper.MAPPER.modelToDto(sectionRepository.save(section));
    }

    public List<SectionQuestionsDto> getByQuestionnaire(UUID id) {
        return sectionRepository.findByQuestionnaireIdOrderByOrder(id)
                .stream()
                .map(section ->
                        SectionMapper.MAPPER.sectionAndQuestionsDto(section, questionRepository.findAllBySectionId(section.getId())))
                .collect(Collectors.toList());
    }

    public List<QuestionDto> getSectionQuestions(UUID sectionId) throws NotFoundException {
        return parseQuestions(sectionRepository.findById(sectionId));
    }

    private List<QuestionDto> parseQuestions(Optional<Section> section) throws NotFoundException {
        return section
                .map(Section::getQuestions)
                .map(q -> q.stream()
                        .map(q2 -> QuestionMapper.MAPPER.questionToQuestionDtoIndexed(q2.getQuestion(), q2.getOrderIndex()))
                        .sorted(Comparator.comparing(QuestionDto::getIndex))
                        .collect(Collectors.toList())
                )
                .orElseThrow(NotFoundException::new);
    }

    public List<QuestionDto> deleteQuestion(UUID sectionId, UUID questionId) throws NotFoundException {
        sectionRepository.deleteQuestion(sectionId, questionId);
        return parseQuestions(sectionRepository.findById(sectionId));
    }

    public SectionDto update(UUID id, SectionUpdateDto dto) throws SectionNotFoundException {
        var section = sectionRepository.findById(id).orElseThrow(SectionNotFoundException::new);
        section.setTitle(dto.getTitle());
        if (dto.getDescription() != null) {
            section.setDescription(dto.getDescription());
        }
        return SectionMapper.MAPPER.modelToDto(sectionRepository.save(section));
    }

    public void reorderQuestions(SectionsQuestionOrderDto dto) throws NotFoundException {
        var oldS = dto.getOldSection();
        var newS = dto.getNewSection();
        var oldI = dto.getOldIndex().intValue();
        var newI = dto.getNewIndex().intValue();

        if (oldS.equals(newS)) {
            var section = sectionRepository.findById(newS).orElseThrow(SectionNotFoundException::new);

            section.getQuestions().forEach(q -> {
                var orderI = q.getOrderIndex().intValue();
                if (orderI == oldI) {
                    q.setOrderIndex(newI);
                    return;
                }
                if (orderI > oldI && orderI < newI) {
                    q.setOrderIndex(--orderI);
                }
            });

            sectionRepository.save(section);
        } else {
            var oldSection = sectionRepository.findById(oldS).orElseThrow(SectionNotFoundException::new);
            var oldQs1 = oldSection.getQuestions();
            var newSection = sectionRepository.findById(newS).orElseThrow(SectionNotFoundException::new);
            var oldQs2 = newSection.getQuestions();

            var q = findByIndex(oldI, oldQs1);
            oldQs1.remove(q);
            oldQs1.forEach(qs -> {
                var orderI = qs.getOrderIndex().intValue();
                if (orderI > oldI) qs.setOrderIndex(--orderI);
            });

            oldQs2.forEach(qs -> {
                var orderI = qs.getOrderIndex().intValue();
                if (orderI >= newI) qs.setOrderIndex(++orderI);
            });
            q.setOrderIndex(newI);
            oldQs2.add(q);

            sectionRepository.saveAll(List.of(oldSection, newSection));
        }
    }

    private SectionQuestion findByIndex(Integer index, List<SectionQuestion> questions) throws SectionNotFoundException {
        return questions.stream()
                .filter(q -> q.getOrderIndex().equals(index))
                .findFirst()
                .orElseThrow(SectionNotFoundException::new);
    }
}
