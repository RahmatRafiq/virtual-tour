import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Category } from '@/types/category';

export default function CategoryForm({ category }: { category?: Category }) {
    const isEdit = !!category;

    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Category Management', href: '/category' },
        { title: isEdit ? 'Edit Category' : 'Create Category', href: '#' },
    ];

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('category.update', category!.id));
        } else {
            post(route('category.store'));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Category' : 'Create Category'} />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Category Management</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    {/* Sidebar */}
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav className="flex flex-col space-y-1">
                            <Button asChild variant="ghost" size="sm" className="justify-start">
                                <Link href="/category">Category List</Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="justify-start">
                                <Link href="/category/trashed">Trashed Categories</Link>
                            </Button>
                        </nav>
                    </aside>
                    <div className="flex-1 md:max-w-2xl space-y-6">
                        <HeadingSmall
                            title={isEdit ? 'Edit Category' : 'Create Category'}
                            description="Fill in the details below"
                        />

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="flex items-center space-x-4">
                                <Button disabled={processing}>
                                    {isEdit ? 'Update Category' : 'Create Category'}
                                </Button>
                                <Link
                                    href={route('category.index')}
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
