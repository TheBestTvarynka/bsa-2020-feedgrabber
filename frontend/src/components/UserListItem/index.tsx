import React, {FC, useState} from "react";

import styles from './styles.module.sass';
import {Button, Image, Modal} from "semantic-ui-react";
import {IRoleState} from "../../reducers/role/reducer";
import {IUserInfo} from "../../models/user/types";
import {ISearchResult} from "../../models/search/Search";

interface IUserListItemProps {
    user: IUserInfo;
    roleState: IRoleState;
    result?: ISearchResult;

    fire(id: string): void;

    loadCompanyRoles(): void;

    setSelectedUser(user: IUserInfo): void;
}

const defaultAvatar =
    "https://40y2ct3ukiiqtpomj3dvyhc1-wpengine.netdna-ssl.com/wp-content/uploads/icon-avatar-default.png";

const UserListItem: FC<IUserListItemProps> = (
    {
        user,
        fire,
        setSelectedUser,
        result
    }
) => {
    const {id, firstName, lastName, role, avatar, userName, phoneNumber} = user;

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const info = firstName && lastName ? `${firstName} ${lastName}` : `${userName}`;

    const confirmationModal = () => {
        return (<Modal
            size="tiny"
            open={showConfirmationModal}
            closeOnDimmerClick
            onClose={() => setShowConfirmationModal(false)}
        >
            <Modal.Header>
                Do you really want to fire {firstName && lastName ? `${firstName} ${lastName}` : `${userName} ?`}
            </Modal.Header>
            <Modal.Actions>
                <Button negative onClick={() => setShowConfirmationModal(false)}>
                    No
                </Button>
                <Button positive
                        onClick={() => {
                            setShowConfirmationModal(false);
                            fire(id);
                        }}>
                    Yes
                </Button>
            </Modal.Actions>
        </Modal>);
    };

    const match = result
        ?.users
        .map(u => u.id)
        .includes(id);

    return (
        <>
            <div className={`${styles.listItem} ${match && styles.searched}`}>
                <div className={styles.userImage}>
                    <Image src={avatar ?? defaultAvatar} size='tiny' circular/>
                </div>
                <div className={styles.info}>
                    <h3 className={styles.paginationListItemHeader}>{info}</h3>
                    <p className={styles.paginationListItemDescription}>{role.replace("_", " ")}</p>
                    <p className={styles.paginationListItemDescription}>{phoneNumber}</p>
                    <p style={
                        {
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }
                    }
                       className={styles.paginationListItemDescription}>
                        {match && 'Matches searched query!'}
                    </p>
                </div>
                <div className={styles.buttonContainer}>
                    <div className={styles.button}>
                        {role !== 'company_owner' && <Button onClick={() => setSelectedUser(user)}>Change role</Button>}
                    </div>
                    <div className={styles.button}>
                        {role !== 'company_owner' &&
                        <Button color={"red"} onClick={() => setShowConfirmationModal(true)}>Fire</Button>}
                    </div>
                </div>

            </div>
            {confirmationModal()}
        </>

    );
};

export default UserListItem;
