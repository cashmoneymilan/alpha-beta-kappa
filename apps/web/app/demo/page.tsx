import { DemoPage } from '@/components/demo/DemoPage';
import '@/styles/demo-themes.css';

export const metadata = {
  title: 'Design System Demo | Trading Terminal',
  description: 'Compare UI themes for the trading terminal',
};

export default function Demo() {
  return <DemoPage />;
}
