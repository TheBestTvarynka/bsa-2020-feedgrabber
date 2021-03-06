import {Button, Form, Message, Header, Menu} from "semantic-ui-react";
import React, {FC} from "react";
import { Link } from 'react-router-dom';
import * as yup from "yup";
import {Formik} from "formik";
import {connect, ConnectedProps} from "react-redux";
import {resetPasswordRoutine} from "../../../sagas/auth/routines";
import styled from "styled-components";
import img from "../../../assets/images/bg-pattern.jpg";

import styles from "./styles.module.sass";
import {useTranslation} from "react-i18next";

const validationSchema = yup.object().shape({
    password: yup
        .string()
        .required("Password required")
        .min(8, "Password too short!")
        .max(16, "Password too long!")
        .matches(/^\w[A-Za-z\d!#$%&'*+\-/=?^_`{}]+$/,
            "Password contains at least 8 characters ( letters, digits and !#$%&'*+-/=?^_`{} )"),
    passwordRepeat: yup
        .string()
        .required("Repeat password")
        .oneOf([yup.ref('password')], 'Passwords must match')
});

const Container = styled.div`
    background-image: url(${img});
    width: 100wv;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
`;

const StyledForm = styled(Form)`
    text-align: center;
    margin: 0 auto;
    width: 30%;
    background: #d2d5d9;
    padding: 1em;
    border-radius: 1em;
`;

const ResetPasswordForm: FC<FormProps & {match}> =
    ({resetPass, match}) => {
        const [ t ] = useTranslation();
        return (
            <Formik
                initialValues={{password: '', passwordRepeat: ''}}
                validationSchema={validationSchema}
                onSubmit={values => {
                    resetPass({
                        password: values.password,
                        token: match.params.id
                    });
                }}
            >
                {({
                      errors,
                      handleChange,
                      handleBlur,
                      handleSubmit
                  }) => {
                    const errorText = errors.password || errors.passwordRepeat;
                    return (
                        <Container>
                            <Menu fixed='top' className={styles.menu}>
                                <Menu.Item as={Link} to="/" header>
                                    <img
                                        style={{marginRight: 10, borderRadius: 10, padding: 5}}
                                        src={require("../../../assets/images/icon_bg.jpg")}
                                        alt="Logo"
                                    />
                                    FeedGrabber
                                </Menu.Item>
                                <Menu.Item position="right" as={Link} to="/auth">
                                    {t("Sign In")}
                                </Menu.Item>
                            </Menu>
                            <StyledForm onSubmit={handleSubmit} autoComplete='off' error={!!errorText}>
                                <Header as="h3">{t("Enter new password")}</Header>
                                <Form.Input name="password" type="password" placeholder="Password"
                                            onChange={handleChange} onBlur={handleBlur} icon="key"
                                />
                                <Form.Input name="passwordRepeat" type="password"
                                            placeholder="Confirm password" icon="repeat"
                                            onChange={handleChange} onBlur={handleBlur}
                                />
                                <Message
                                    style={{width: '70%', margin: '10px auto'}}
                                    error
                                    content={t(errorText)}
                                />
                                <Button disabled={!!errors.password || !!errors.passwordRepeat}
                                        primary
                                        type="submit"
                                        content="Update"
                                />
                            </StyledForm>
                        </Container>
                    );
                }}
            </Formik>
        );

    };

const mapDispatch = {
    resetPass: resetPasswordRoutine
};

const connector = connect(null, mapDispatch);

type FormProps = ConnectedProps<typeof connector>;

export default connector(ResetPasswordForm);
