import GlobalSettingsLayout from '@/components/settings/GlobalSettingsLayout';

export const metadata = { title: 'Global Settings - TraceWeave' };

export default function SettingsPage() {
  // Mounts the layout with 'appearance' or 'account' tab pre-selected
  return <GlobalSettingsLayout initialTab="appearance" />;
}