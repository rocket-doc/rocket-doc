import { SpecContext } from '../../lib/context';
import { usePersistentResize } from '../../lib/hooks/resize';
import { useWindow } from '../../lib/hooks/window';
import React, { useContext, useEffect } from 'react';
import { FileLoader } from './FileLoader';
import Paths from './Paths';

type NavbarProps = {
  logo: string;
  showSpecFileLoader?: boolean;
  setNavbarSize: (size: number) => void;
};

const Navbar: React.FC<NavbarProps> = ({ logo, showSpecFileLoader, setNavbarSize }) => {
  const { width } = useWindow();
  const { widthRatio, handleMouseDown } = usePersistentResize('navbar-width-ratio');
  const { spec } = useContext(SpecContext);

  useEffect(() => {
    setNavbarSize(widthRatio * width);
  }, [widthRatio, width]);

  return (
    <div className="flex overflow-hidden">
      <div
        className="bg-gray-800 text-white h-screen flex-shrink-0 fixed top-0 overflow-y-auto z-[100]"
        style={{ width: `${widthRatio * width}px`, minWidth: '0px', maxWidth: '50vw' }}
      >
        <div className="p-4 flex items-center">
          <img src={logo} className="mr-2" style={{ height: '2rem' }} />
          <span className="leading-8 text-2xl">{spec?.info?.title ?? "Rocket Doc"}</span>
        </div>
        {showSpecFileLoader && (
          <div className="p-4">
            <FileLoader />
          </div>
        )}
        <Paths />
      </div>
      <div
        className="h-screen w-1 cursor-ew-resize bg-gray-800"
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
};

export default Navbar;
