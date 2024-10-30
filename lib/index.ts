import RocketDoc from '@/RocketDoc/RocketDoc';
import { MountRocketDoc } from './RocketDoc/element';

export { RocketDoc };

window.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.querySelector('rocket-doc');
  if (rootElement) {
    MountRocketDoc(rootElement);
  }
})
