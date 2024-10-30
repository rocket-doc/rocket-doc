import usePersistentState from "./persistant";

export function usePersistentResize(key: string, maxRation?: number) {
  const [widthRatio, setWidthRatio] = usePersistentState(key, 1 / 4);

  const handleMouseDown = (_: React.MouseEvent) => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const ratio = e.clientX / window.innerWidth;
    if (maxRation && ratio > maxRation) return;
    setWidthRatio(ratio);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return { widthRatio, handleMouseDown };
}
