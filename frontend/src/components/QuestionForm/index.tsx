import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import ReactResizeDetector from 'react-resize-detector';
import {QuestionType} from "../../models/forms/Questions/IQuesion";
import {IAppState} from "models/IAppState";
import {isEqual} from "lodash";
import {connect, ConnectedProps} from "react-redux";
import {loadCategoriesRoutine} from "sagas/categories/routines";
import {Checkbox, Divider, Dropdown, Form, Loader} from "semantic-ui-react";
import {addQToFormRoutine, deleteQInFormRoutine, updateQInFormRoutine} from "../../sagas/sections/routines";
import {useFormik} from "formik";
import {renderForm} from "./defaultValues";
import styles from "./styles.module.sass";
import {useTranslation} from "react-i18next";
import QuestionDetailsOptions from "./QuestionDetailsOptions";
import {mainSchema} from "./schemas";
import useOutsideAlerter from "../../helpers/outsideClick.hook";
import {saveQuestionRoutine, updateQuestionRoutine} from "../../sagas/questions/routines";
import {setFloatingMenuPos} from "../../sagas/app/routines";
import {getCurrentEntity} from "../../helpers/formEditor.helper";

export interface IQuestionListEditProps {
    cancel: () => void;
}

const QuestionForm: FC<QuestionFormProps & { listEdit?: IQuestionListEditProps }> = (
    {
        listEdit,
        currentQuestion,
        isLoading,
        updateQuestion,
        loadCategories,
        shouldUpdatePos,
        questionnaireId,
        currentSectionId,
        isCatLoading,
        setMenuPos,
        categories,
        addQuestion
    }) => {
    const [isDetailsValid, setValid] = useState(true);
    const [localCategories, setLocalCategories] = useState<string[]>(categories);
    const ref = useRef(null);
    const [t] = useTranslation();

    useOutsideAlerter(ref, () => onSubmit());

    const formik = useFormik({
        initialValues: {
            question: currentQuestion,
            name: currentQuestion.name,
            categoryTitle: currentQuestion.categoryTitle,
            isRequired: currentQuestion.isRequired
        },
        validationSchema: mainSchema,
        onSubmit: () => undefined
    });

    useEffect(() => {
        setMenuPos(ref.current?.getBoundingClientRect().y);
    }, [currentQuestion, setMenuPos, shouldUpdatePos]);

    useEffect(() => {
        setLocalCategories(categories);
    }, [categories]);

    const onSubmit = useCallback(() => {
        if (isDetailsValid && formik.isValid) {
            const {question, ...rest} = formik.values;
            const sum = {...question, ...rest};
            if (!isEqual(sum, currentQuestion)) {
                listEdit ?
                    addQuestion(sum) :
                    !sum.id ? addQuestion({...sum, questionnaireId, sectionId: currentSectionId})
                        : updateQuestion(sum);
            }
        }
    }, [currentQuestion, addQuestion, updateQuestion,
        formik.values, isDetailsValid, currentSectionId, questionnaireId, formik.isValid, listEdit]);

    useEffect(() => {
        const timer = setTimeout(() => onSubmit(), 3000);
        return () => clearTimeout(timer);
    }, [onSubmit]);

    const handleQuestionDetailsUpdate = state => {
        const {isCompleted, value} = state;
        formik.setFieldValue("question", {...formik.values.question, details: value});
        setValid(isCompleted);
    };

    const setQuestionType = data => {
        const type: QuestionType = data.value;
        formik.setFieldValue("question", {...formik.values.question, type, details: {}});
    };

    const parseCategories = categories => categories.length ?
        categories.map(cat => ({key: cat, value: cat, text: cat}))
        : [{
            key: currentQuestion.categoryTitle,
            value: currentQuestion.categoryTitle,
            text: currentQuestion.categoryTitle
        }];

    const handleCategoriesLoad = () => !localCategories.length && loadCategories();

    return (
        <div className={`${styles.question_container}`} ref={ref}>
            {isLoading ? <Loader active inline='centered'/>
                :
                <ReactResizeDetector onResize={() => setMenuPos(ref.current.getBoundingClientRect().y)}>
                    {() =>
                        <div className={styles.question_container}>
                            <Form className={styles.question_form}>
                                <div className={styles.question_input_type}>
                                    <Form.Input
                                        inverted
                                        className={styles.question_input}
                                        fluid
                                        id="name"
                                        placeholder={t("Type your question")}
                                        type="text"
                                        value={formik.values.name}
                                        name="name"
                                        error={
                                            formik.touched.name && formik.errors.name
                                                ? t(formik.errors.name)
                                                : undefined
                                        }
                                        onChange={formik.handleChange}
                                    />
                                    <QuestionDetailsOptions
                                        question={formik.values.question}
                                        setQuestionType={setQuestionType}
                                    />
                                </div>
                                <div className={styles.secondRow}>
                                    <div className={styles.categoryItem}>
                                        <Dropdown
                                            loading={isCatLoading}
                                            id="categoryTitle"
                                            icon="tag"
                                            labeled
                                            className="icon"
                                            button
                                            selection={false}
                                            onClick={handleCategoriesLoad}
                                            allowAdditions
                                            onChange={(e, {value}) => formik.setFieldValue("categoryTitle", value)}
                                            value={formik.values.categoryTitle}
                                            onAddItem={(e, {value}) => {
                                                setLocalCategories([value as string, ...localCategories]);
                                            }}
                                            search
                                            options={parseCategories(localCategories ?? formik.values.categoryTitle)}
                                            onBlur={formik.handleBlur}
                                        />
                                    </div>
                                    <div className={styles.requiredItem}>
                                        <span>Required</span>
                                        <Checkbox
                                            toggle

                                            fitted
                                            id="isRequired"
                                            name="isRequired"
                                            checked={formik.values.isRequired}
                                            onChange={formik.handleChange}
                                        />
                                    </div>
                                </div>
                                <Divider style={{marginTop: 8}}/>
                                <div className={styles.question_form_answers}>
                                    {renderForm(formik.values.question, handleQuestionDetailsUpdate)}
                                </div>
                            </Form>
                        </div>
                    }
                </ReactResizeDetector>
            }
        </div>
    );
};

const mapState = (state: IAppState, ownProps) => ({
    isLoading: state.formEditor.isLoading,
    categories: state.categories.list,
    shouldUpdatePos: state.formEditor.sections.entities,
    isCatLoading: state.categories.isLoading,
    currentQuestion: ownProps.isList
        ? state.questions.currentQuestion
        : getCurrentEntity(state.formEditor.questions).question,
    questionnaireId: state.formEditor.questionnaire.id,
    currentSectionId: state.formEditor.sections.currentId
});

const mapDispatch = (dispatch, ownProps) => ({
    addQuestion: (a: any) => dispatch(ownProps.isList
        ? ownProps.isListNew
            ? saveQuestionRoutine(a)
            : updateQuestionRoutine(a)
        : addQToFormRoutine(a)),
    updateQuestion: (a: any) => dispatch(updateQInFormRoutine(a)),
    loadCategories: () => dispatch(loadCategoriesRoutine()),
    deleteQuestion: (a: any) => dispatch(deleteQInFormRoutine(a)),
    setMenuPos: (a: any) => dispatch(setFloatingMenuPos(a))
});

const connector = connect(mapState, mapDispatch);

type QuestionFormProps = ConnectedProps<typeof connector>;

export default connector(QuestionForm);
