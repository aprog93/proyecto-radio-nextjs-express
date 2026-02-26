import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface CreateUserFormProps {
  onSuccess: () => void;
}

const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'listener',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      toast.error(t('admin.validation.required_fields'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('admin.validation.password_length'));
      return;
    }

    setIsLoading(true);
    try {
      await api.admin.createUser({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || undefined,
        role: formData.role,
      });

      toast.success(t('admin.user_created'));
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.create_failed');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium text-foreground block mb-1">
          {t('admin.columns.email')} *
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="user@example.com"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-foreground block mb-1">
          {t('admin.password')} *
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
          required
          minLength={6}
        />
      </div>

      <div>
        <label htmlFor="displayName" className="text-sm font-medium text-foreground block mb-1">
          {t('admin.columns.name')}
        </label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="Full name"
          value={formData.displayName}
          onChange={handleInputChange}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="role" className="text-sm font-medium text-foreground block mb-1">
          {t('admin.columns.role')}
        </label>
        <Select value={formData.role} onValueChange={handleRoleChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">{t('admin.role.admin')}</SelectItem>
            <SelectItem value="listener">{t('admin.role.listener')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full gap-2">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {t('admin.create_user')}
      </Button>
    </form>
  );
};

export default CreateUserForm;
