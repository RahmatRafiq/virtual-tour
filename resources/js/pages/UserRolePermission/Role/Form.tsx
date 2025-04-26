import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import type { Role, Permission } from '@/types/UserRolePermission';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Separator } from '@/components/ui/separator';
import CustomSelect from '@/components/select';

export default function RoleForm({ role, permissions }: { role?: Role; permissions: Permission[] }) {
  const isEdit = !!role;
  const { data, setData, post, put, processing, errors } = useForm({
    name: role ? role.name : '',
    guard_name: role ? role.guard_name : 'web', // default ke 'web'
    permissions: role && role.permissions ? role.permissions.map(p => p.id) : [],
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '/settings' },
    { title: 'Role Management', href: '/roles' },
    { title: isEdit ? 'Edit Role' : 'Create Role', href: '#' },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      put(route('roles.update', role!.id));
    } else {
      post(route('roles.store'));
    }
  };

  const permissionOptions = permissions.map(p => ({
    value: p.id,
    label: p.name,
  }));

  const guardOptions = [
    { value: 'web', label: 'web' },
    { value: 'api', label: 'api' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEdit ? 'Edit Role' : 'Create Role'} />
      <div className="px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>

        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
          {/* Sidebar */}
          <aside className="w-full max-w-xl lg:w-48">
            <nav className="flex flex-col space-y-1">
              <Button asChild variant="ghost" size="sm" className="justify-start">
                <Link href="/users">User List</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="justify-start">
                <Link href="/roles">Role Management</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="justify-start">
                <Link href="/permissions">Permission Management</Link>
              </Button>
            </nav>
          </aside>

          <Separator className="my-6 md:hidden" />

          {/* Content */}
          <div className="flex-1 md:max-w-2xl space-y-6">
            <HeadingSmall
              title={isEdit ? 'Edit Role' : 'Create Role'}
              description="Fill in the details below"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
                <InputError message={errors.name} />
              </div>

              <div>
                <Label htmlFor="guard">Guard</Label>
                <CustomSelect
                  id="guard"
                  options={guardOptions}
                  value={guardOptions.find(option => option.value === data.guard_name)}
                  onChange={(selected) => setData('guard_name', (selected as { value: string }).value)}
                />
                <InputError message={errors.guard_name} />
              </div>

              <div>
                <Label htmlFor="permissions">Permissions</Label>
                <CustomSelect
                  id="permissions"
                  isMulti
                  options={permissionOptions}
                  value={permissionOptions.filter(option => data.permissions.includes(option.value))}
                  onChange={(newValue) =>
                    setData(
                      'permissions',
                      Array.isArray(newValue) ? newValue.map(option => option.value) : []
                    )
                  }
                />
                <InputError message={errors.permissions} />
              </div>

              <div className="flex items-center space-x-4">
                <Button disabled={processing}>
                  {isEdit ? 'Update Role' : 'Create Role'}
                </Button>
                <Link
                  href={route('roles.index')}
                  className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70"
                >
                  Cancel
                </Link>
              </div>
            </form>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
