import React from 'react';
import {Icon} from 'semantic-ui-react';
import {NavLink} from 'react-router-dom';

import styles from './styles.module.sass';

interface ISideMenuProps {
  expanded: boolean;

  toggleMenu(): void;
}

const SideMenu: React.FunctionComponent<ISideMenuProps> = ({expanded, toggleMenu}) => {
  return (
    <div className={`${styles.menuWrapper} ${expanded ? styles.menuWrapperOpen : styles.menuWrapperClosed}`}>
      <div className={styles.menuContent}>
        <span className={styles.menuItem} onClick={toggleMenu}>
          <Icon className={styles.menuItemIcon} name={expanded ? "arrow circle left" : "bars"} />
        </span>
        <NavLink exact to="/" className={styles.menuItem} activeClassName={styles.menuItemActive}>
          <Icon className={styles.menuItemIcon} name="home" />
          <span className={styles.menuItemTitle}>HOME</span>
        </NavLink>
        <NavLink to="/company" className={styles.menuItem} activeClassName={styles.menuItemActive}>
          <Icon className={styles.menuItemIcon} name="columns" />
          <span className={styles.menuItemTitle}>COMPANY DASHBOARD</span>
        </NavLink>
        <NavLink to="/questionnaires" className={styles.menuItem} activeClassName={styles.menuItemActive}>
          <Icon className={styles.menuItemIcon} name="list alternate outline" />
          <span className={styles.menuItemTitle}>QUESTIONNAIRES</span>
        </NavLink>
        <NavLink to="/teams" className={styles.menuItem} activeClassName={styles.menuItemActive}>
          <Icon className={styles.menuItemIcon} name="users" />
          <span className={styles.menuItemTitle}>TEAMS</span>
        </NavLink>
        <NavLink to="/questions" className={styles.menuItem} activeClassName={styles.menuItemActive}>
          <Icon className={styles.menuItemIcon} name="question circle outline" />
          <span className={styles.menuItemTitle}>QUESTIONS</span>
        </NavLink>
        <NavLink to="/employees" className={styles.menuItem} activeClassName={styles.menuItemActive}>
          <Icon className={styles.menuItemIcon} name="user outline" />
          <span className={styles.menuItemTitle}>EMPLOYEES</span>
        </NavLink>
      </div>
    </div>
  );
};

export default SideMenu;
