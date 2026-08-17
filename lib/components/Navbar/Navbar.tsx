import { securityRoute } from '@/components/Security/Security';
import { SpecContext, UserConfigContext } from '@/lib/context';
import { IconBrightness, IconBrightnessFilled, IconKey } from '@tabler/icons-react';
import { Switch, Tooltip } from 'antd';
import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ClearSpec } from './ClearSpec';
import { FileLoader } from './FileLoader';
import Paths from './Paths';

type NavbarProps = {
  logo: string;
  showSpecFileLoader?: boolean;
  showClearSpec?: boolean;
  defaultTitle: string;
  // Called when a navigation link is followed, used to close the mobile drawer
  onNavigate?: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ logo, showSpecFileLoader, showClearSpec, defaultTitle, onNavigate }) => {
  const { spec } = useContext(SpecContext);
  const { config, setConfig } = useContext(UserConfigContext);

  return (
    <div className="rd-sidebar rd-scroll h-full max-h-screen overflow-y-auto w-full" onClick={(e) => {
      if (e.target instanceof HTMLElement && e.target.closest('a')) onNavigate?.();
    }}>
      <div className="p-3 flex items-center gap-2">
        <Link to="/" className="flex items-center min-w-0" style={{ color: 'var(--rd-sidebar-fg)' }}>
          <img src={logo} className="mr-2" style={{ height: '2rem' }} alt="" />
          <span className="leading-8 text-xl font-semibold truncate">{spec?.info?.title ?? defaultTitle}</span>
        </Link>
        <Switch
          checkedChildren={<div className='h-[22px] flex items-center'><IconBrightnessFilled size={20} /></div>}
          unCheckedChildren={<div className='h-[22px] flex items-center'><IconBrightness size={20} /></div>}
          checked={!config.darkMode}
          onChange={() => setConfig({ ...config, darkMode: !config.darkMode })}
          className='ml-auto'
        />
        {showClearSpec && <ClearSpec />}
      </div>
      {showSpecFileLoader && (
        <div className='mb-1 px-1'>
          <FileLoader />
        </div>
      )}
      {spec && <Tooltip title="Credentials stored in this browser" placement="right">
        <NavLink
          to={securityRoute}
          className={({ isActive }) => "flex items-center gap-2 px-3 py-1 text-sm rd-sidebar-item " + (isActive ? "rd-sidebar-item-active" : "")}
        >
          <IconKey size={16} /> Security keys
        </NavLink>
      </Tooltip>}
      <Paths />
    </div>
  );
};

export default Navbar;
