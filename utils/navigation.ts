import { TabRoute } from '@/types/navigation';

export function createTabPath(name: TabRoute): string {
  return `/${name}`;
}

export function getActiveTab(pathname: string): TabRoute {
  return (pathname.split('/')[1] || 'index') as TabRoute;
}