import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export interface SidebarRoute { path: string; name: string; icon?: string; }

interface SidebarProps { routes: SidebarRoute[]; }

const Sidebar: React.FC<SidebarProps> = ({ routes }) => (
  <div className="sidebar">
    <div className="sidebar-wrapper">
      <nav className="sidebar-nav">
        {routes.map((r) => (
          <NavLink
            key={r.path}
            to={r.path}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' active' : '')
            }
          >
            {r.icon && <i className={r.icon} />}
            <span>{r.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  </div>
);

export default Sidebar;
