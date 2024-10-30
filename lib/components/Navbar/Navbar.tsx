import { SpecContext, UserConfigContext } from '@/lib/context';
import { IconBrightness, IconBrightnessFilled } from '@tabler/icons-react';
import { Switch } from 'antd';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FileLoader } from './FileLoader';
import Paths from './Paths';

type NavbarProps = {
  logo: string;
  showSpecFileLoader?: boolean;
  defaultTitle: string;
};

const Navbar: React.FC<NavbarProps> = ({ logo, showSpecFileLoader, defaultTitle }) => {
  const { spec } = useContext(SpecContext);
  const { config, setConfig } = useContext(UserConfigContext);

  return (
    <div className="bg-gray-800 text-white h-screen overflow-y-auto w-full">
      <div className="p-4 flex items-center">
        <Link to="/" className="flex items-center">
          <img src={logo} className="mr-2" style={{ height: '2rem' }} />
          <span className="leading-8 text-2xl">{spec?.info?.title ?? defaultTitle}</span>
        </Link>
        <Switch
          checkedChildren={<div className='h-[22px] flex items-center'><IconBrightnessFilled size={20} /></div>}
          unCheckedChildren={<div className='h-[22px] flex items-center'><IconBrightness size={20} /></div>}
          checked={!config.darkMode}
          onChange={() => setConfig({ ...config, darkMode: !config.darkMode })}
          className='ml-auto'
        />
      </div>
      {showSpecFileLoader && (
        <div className="p-4">
          <FileLoader />
        </div>
      )}
      <Paths />
    </div>

  );
};

export default Navbar;
