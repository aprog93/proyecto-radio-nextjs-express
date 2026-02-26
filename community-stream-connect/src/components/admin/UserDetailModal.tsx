import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: number;
  email: string;
  displayName?: string;
  role: string;
  createdAt: string;
}

interface UserDetailModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleUpdate: (userId: number, newRole: string) => Promise<void>;
  onDelete: (userId: number) => void;
}

const UserDetailModal = ({ user, open, onOpenChange, onRoleUpdate, onDelete }: UserDetailModalProps) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(user?.role || 'listener');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return null;

  const handleRoleUpdate = async () => {
    if (selectedRole === user.role) {
      toast.info(t('admin.no_changes'));
      return;
    }

    setIsUpdating(true);
    try {
      await onRoleUpdate(user.id, selectedRole);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('admin.user_details')}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('admin.columns.email')}</label>
              <p className="text-lg font-mono text-foreground mt-1">{user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('admin.columns.name')}</label>
              <p className="text-lg text-foreground mt-1">{user.displayName || '-'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">{t('admin.columns.joined')}</label>
              <p className="text-lg text-foreground mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('admin.columns.role')}</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('admin.role.admin')}</SelectItem>
                  <SelectItem value="listener">{t('admin.role.listener')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleRoleUpdate}
              disabled={isUpdating || selectedRole === user.role}
              className="flex-1 gap-2"
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('admin.update_role')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onOpenChange(false);
                onDelete(user.id);
              }}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('admin.delete')}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('admin.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
