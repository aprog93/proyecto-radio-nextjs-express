import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import {
  Users,
  TrendingUp,
  BookOpen,
  Calendar,
  ShoppingBag,
  DollarSign,
  Loader2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import UserDetailModal from '@/components/admin/UserDetailModal';
import CreateUserForm from '@/components/admin/CreateUserForm';

const ITEMS_PER_PAGE = 20;

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  listeners: number;
  totalBlogs: number;
  publishedBlogs: number;
  totalNews: number;
  publishedNews: number;
  totalEvents: number;
  publishedEvents: number;
  totalProducts: number;
  publishedProducts: number;
  totalDonations: { count: number; amount: number };
}

interface UserRow {
  id: number;
  email: string;
  displayName?: string;
  role: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/web/login', { replace: true });
      return;
    }
    if (user?.role !== 'admin') {
      navigate('/', { replace: true });
      toast.error(t('admin.not_authorized'));
    }
  }, [isAuthenticated, user, navigate, t]);

  // Fetch stats
  const { data: stats, loading: statsLoading, error: statsError } = useApi(
    () => api.admin.getStats(),
    { autoFetch: isAuthenticated && user?.role === 'admin', deps: [isAuthenticated, user?.role, refreshTrigger] }
  );

  // Fetch users with pagination and search
  const { data: usersResponse, loading: usersLoading, error: usersError } = useApi(
    () => api.admin.listUsers(currentPage, ITEMS_PER_PAGE, searchQuery),
    { autoFetch: isAuthenticated && user?.role === 'admin', deps: [isAuthenticated, user?.role, currentPage, searchQuery, refreshTrigger] }
  );

  const users = usersResponse?.users || [];
  const totalPages = usersResponse?.pagination?.totalPages || 1;

  // Handle search with debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm(t('admin.confirm_delete_user'))) return;

    try {
      await api.admin.deleteUser(userId);
      toast.success(t('admin.user_deleted'));
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.delete_failed');
      toast.error(message);
    }
  };

  // Handle user role update
  const handleRoleUpdate = async (userId: number, newRole: string) => {
    try {
      await api.admin.updateUser(userId, { role: newRole });
      toast.success(t('admin.user_updated'));
      setRefreshTrigger((prev) => prev + 1);
      setShowDetailModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('admin.update_failed');
      toast.error(message);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">{t('admin.title')}</h1>
              <p className="text-muted-foreground mt-1">{t('admin.subtitle')}</p>
            </div>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('admin.create_user')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{t('admin.create_new_user')}</DialogTitle>
                  <DialogDescription>{t('admin.create_user_description')}</DialogDescription>
                </DialogHeader>
                <CreateUserForm
                  onSuccess={() => {
                    setShowCreateModal(false);
                    setRefreshTrigger((prev) => prev + 1);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics Cards */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : statsError ? (
            <div className="text-center text-destructive py-8">
              <p>{statsError}</p>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatsCard icon={Users} label={t('admin.stats.total_users')} value={stats.totalUsers} trend={stats.activeUsers} />
              <StatsCard icon={TrendingUp} label={t('admin.stats.active_users')} value={stats.activeUsers} subtext={t('admin.stats.admins', { count: stats.admins })} />
              <StatsCard icon={BookOpen} label={t('admin.stats.content')} value={stats.totalBlogs + stats.totalNews} subtext={`${stats.publishedBlogs + stats.publishedNews} ${t('admin.stats.published')}`} />
              <StatsCard icon={DollarSign} label={t('admin.stats.donations')} value={`$${stats.totalDonations.amount.toLocaleString()}`} subtext={`${stats.totalDonations.count} ${t('admin.stats.transactions')}`} />
            </div>
          ) : null}
        </motion.div>

        {/* User Management Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">{t('admin.user_management')}</h2>
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t('admin.search_users')}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Users Table */}
            {usersLoading ? (
              <SkeletonTable rows={10} cols={5} />
            ) : usersError ? (
              <div className="text-center text-destructive py-8">
                <p>{usersError}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">{t('admin.no_users_found')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('admin.columns.email')}</TableHead>
                        <TableHead>{t('admin.columns.name')}</TableHead>
                        <TableHead>{t('admin.columns.role')}</TableHead>
                        <TableHead>{t('admin.columns.joined')}</TableHead>
                        <TableHead className="text-right">{t('admin.columns.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-mono text-sm">{user.email}</TableCell>
                          <TableCell>{user.displayName || '-'}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}
                            >
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDetailModal(true);
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-primary hover:text-primary/80"
                                title={t('admin.view_details')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowDetailModal(true);
                                }}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                                title={t('admin.edit')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 hover:bg-muted rounded-lg transition-colors text-destructive hover:text-destructive/80"
                                title={t('admin.delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <p className="text-sm text-muted-foreground">
                      {t('admin.page', { current: currentPage, total: totalPages })}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {t('admin.previous')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="gap-2"
                      >
                        {t('admin.next')}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </motion.div>

        {/* User Detail Modal */}
        <UserDetailModal
          user={selectedUser}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          onRoleUpdate={handleRoleUpdate}
          onDelete={handleDeleteUser}
        />
      </div>
    </div>
  );
};

// Statistics Card Component
interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: number;
  subtext?: string;
}

const StatsCard = ({ icon: Icon, label, value, trend, subtext }: StatsCardProps) => (
  <Card className="p-6 border-l-4 border-l-primary hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-2">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
        {trend !== undefined && (
          <p className="text-xs text-muted-foreground mt-2">
            {trend} {label.toLowerCase()}
          </p>
        )}
        {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
      </div>
      <Icon className="w-8 h-8 text-primary/20" />
    </div>
  </Card>
);

export default AdminDashboard;
