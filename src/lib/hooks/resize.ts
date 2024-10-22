import usePersistentState from "./persistant";

export function usePersistentResize(key: string) {
  const [widthRatio, setWidthRatio] = usePersistentState(key, 1 / 4);

  const handleMouseDown = (_: React.MouseEvent) => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    setWidthRatio(e.clientX / window.innerWidth);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return { widthRatio, handleMouseDown };
}
