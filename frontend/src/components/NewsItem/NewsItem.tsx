import React, {FC} from "react";
import styles from './styles.module.scss';
import {ICompanyFeedItem} from "../../models/companyFeed/ICompanyFeedItem";
import UICardBlock from "../UI/UICardBlock";

export interface INewsItemProps {
    item: ICompanyFeedItem;
}

const defaultNewsImage = "https://img.icons8.com/cotton/2x/news.png";

const NewsItem: FC<INewsItemProps> = ({item}) => {
    return (
        <UICardBlock key={item.id}
                     className={styles.newsItemContainer}>
            <>
            <img src={item.image? item.image?.link : defaultNewsImage} alt='' height="200" width="180"/>
            <div className={styles.detailesContainer}>
                <div className={styles.mainContainer}>
                    <div className={styles.type}>{item.type}</div>
                    <div className={styles.title}>{item.title}</div>
                    <div className={styles.body}>{item.body}</div>
                </div>
                <div className={styles.authorContainer}>
                    {item.user.avatar
                        ? <img src={item.user.avatar} alt='avatar' height="50" width="50"/>
                        : <div/>
                    }
                    <div className={styles.detailesAuthorContainer}>
                        <div className={styles.userName}>{item.user.username}</div>
                        <div className={styles.date}>{item.createdAt}</div>
                    </div>
                </div>
            </div>
            <div className={styles.reactionsContainer}>

            </div>
            </>
        </UICardBlock>
    );
};

export default NewsItem;