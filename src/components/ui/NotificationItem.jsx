import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export const NotificationItem = ({ notification, onClose }) => {
  const router = useRouter();
  const store = useAppStore();

  const handleNotificationClick = async () => {
    // 1. Mark as read in the background
    api.post(`/notifications/${notification.id}/read`);
    
    // 2. Route based on Notification Type and Metadata
    const { type, metadata, actionUrl } = notification;

    if (actionUrl) {
      router.push(actionUrl);
    } 
    else if (type === 'WORKFLOW_FAILED' || type === 'WORKFLOW_SUCCESS') {
      // Ensure we are in the right workspace context before routing
      if (metadata.workspaceId !== store.activeWorkspaceId) {
        store.setActiveWorkspace(metadata.workspaceId);
      }
      
      // Route directly to the specific execution logs
      router.push(`/workspace/${metadata.workspaceId}/workflows/${metadata.workflowId}?exec=${metadata.executionId}`);
    } 
    else if (type === 'WORKSPACE_INVITE') {
      router.push(`/invites/${metadata.inviteId}`);
    }
    
    onClose(); // Close the notification dropdown
  };

  return (
    <div 
      onClick={handleNotificationClick}
      className={`p-3 cursor-pointer hover:bg-white/5 transition-colors ${!notification.isRead ? 'border-l-2 border-brand-primary bg-brand-primary/5' : ''}`}
    >
      <h4 className="text-sm font-semibold">{notification.title}</h4>
      <p className="text-xs text-text-muted mt-1">{notification.message}</p>
      <span className="text-[10px] text-text-muted mt-2 block">
        {new Date(notification.createdAt).toLocaleDateString()}
      </span>
    </div>
  );
};