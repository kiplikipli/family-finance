import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useUsers, useCreateUser, useDeleteUser } from '@/hooks/use-users';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/use-categories';
import { useTags, useCreateTag, useDeleteTag } from '@/hooks/use-tags';

export function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {isAdmin && <UsersSection />}
      <CategoriesSection />
      <TagsSection />
    </div>
  );
}

function UsersSection() {
  const { data: users } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser.mutateAsync(form);
    setShowCreate(false);
    setForm({ name: '', email: '', password: '', role: 'USER' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Users</CardTitle>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-3 w-3" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users?.map((u: any) => (
            <div key={u.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>
                <Badge variant={u.isActive ? 'outline' : 'destructive'}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => deleteUser.mutate(u.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent onClose={() => setShowCreate(false)}>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function CategoriesSection() {
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', scope: 'GLOBAL' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCategory.mutateAsync(form);
    setShowCreate(false);
    setForm({ name: '', type: 'EXPENSE', scope: 'GLOBAL' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categories</CardTitle>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-3 w-3" />
          Add Category
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories?.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="font-medium">{c.name}</p>
                <Badge variant={c.type === 'INCOME' ? 'default' : 'destructive'}>{c.type}</Badge>
                <Badge variant="outline">{c.scope}</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteCategory.mutate(c.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent onClose={() => setShowCreate(false)}>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scope</Label>
                <Select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
                  <option value="GLOBAL">Global</option>
                  <option value="PRIVATE">Private</option>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={createCategory.isPending}>
                  {createCategory.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function TagsSection() {
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTag.mutateAsync({ name });
    setShowCreate(false);
    setName('');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tags</CardTitle>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-3 w-3" />
          Add Tag
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag: any) => (
            <div key={tag.id} className="flex items-center gap-1">
              <Badge variant="secondary">{tag.name}</Badge>
              <button
                className="text-muted-foreground hover:text-destructive"
                onClick={() => deleteTag.mutate(tag.id)}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent onClose={() => setShowCreate(false)}>
            <DialogHeader>
              <DialogTitle>Create Tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" disabled={createTag.isPending}>
                  {createTag.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
