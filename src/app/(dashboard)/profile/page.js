import GlobalSettingsLayout from '@/components/settings/GlobalSettingsLayout';

export const metadata = { 
    title: 'User Profile - TraceWeave',
    description: 'Manage your personal account settings and preferences.'
};

// Ensure page is rendered client-side for store access
export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return <GlobalSettingsLayout initialTab="profile" />;
}