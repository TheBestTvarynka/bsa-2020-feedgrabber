import React, {FC, useEffect, useState} from "react";
import {IAppState} from "../../models/IAppState";
import {connect, ConnectedProps} from "react-redux";
import {saveAndGetQuestionnaireRoutine} from "../../sagas/qustionnaires/routines";
import {history} from "../../helpers/history.helper";
import {toastr} from 'react-redux-toastr';
import moment from "moment";
import {useTranslation} from "react-i18next";
import {Modal, Input} from "semantic-ui-react";
import UIButton from "../UI/UIButton";

const RedirectFormEditor: FC<Props> = ({current, saveAndGet}) => {
    const [title, setTitle] = useState<string>(`New Form created ${moment().calendar()}`);
    const [open, setOpen] = useState<boolean>(!current);
    const [t] = useTranslation();

    function handleCancel() {
        history.goBack();
        setOpen(false);
    }

    function handleSubmit() {
        saveAndGet({title: title ?? `New Form created ${moment().calendar()}`});
        setOpen(false);
        toastr.success("Form created");
    }

    useEffect(() => {
        current && history.push(`/questionnaires/${current}`);
    }, [current]);

    return (
    <Modal
        open={open}
        size="small"
        onClose={handleCancel}
        dimmer="blurring"
        style={{textAlign: "center"}}
    >
        <Modal.Content>
            <Modal.Description as="h3">
                <p>{t("No currently edited form")}</p>
                {t("Let's create new right now!")}
            </Modal.Description>
            <Input
                icon='hashtag'
                iconPosition='left'
                size="large"
                label={{ tag: true, content: t('Add Title') }}
                labelPosition='right'
                style={{width: '80%'}}
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
        </Modal.Content>
        <Modal.Actions>
           <UIButton center title={t("Create")} primary onClick={handleSubmit}/>
        </Modal.Actions>
    </Modal>
    );
};

const mapState = (state: IAppState) => ({
    current: state.formEditor.questionnaire.id
});

const mapDispatch = {
    saveAndGet: saveAndGetQuestionnaireRoutine
};

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>;

export default connector(RedirectFormEditor);
