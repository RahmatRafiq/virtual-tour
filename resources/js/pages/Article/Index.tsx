import { useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import DataTableWrapper, { DataTableWrapperRef } from '@/components/datatables';
import { BreadcrumbItem } from '@/types';
import { Category } from '@/types/category';
import clsx from 'clsx';
import { Article } from '@/types/article';

export default function ArticleIndex() {
    const { filter: initialFilter, categories } = usePage<{
        filter: string;
        categories: Category[];
    }>().props;

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Articles', href: '/article' }];
    const dtRef = useRef<DataTableWrapperRef>(null);
    const [filter, setFilter] = useState(initialFilter || 'active');
    const [categoryId, setCategoryId] = useState<number | ''>('');

    const columns = [
        { data: 'id', title: 'ID' },
        { data: 'title', title: 'Title' },
        { data: 'slug', title: 'Slug' },
        { data: 'category', title: 'Category' },
        { data: 'created_at', title: 'Created At' },
        { data: 'updated_at', title: 'Updated At' },
        {
            data: null,
            title: 'Actions',
            orderable: false,
            searchable: false,
            render: (_: null, __: string, row: unknown) => {
                const article = row as Article
                let html = '';
                if (filter === 'trashed' || (filter === 'all' && article.trashed)) {
                    html += `<button class="btn-restore ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700" data-id="${article.id}">Restore</button>`;
                    html += `<button class="btn-force-delete ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" data-id="${article.id}">Force Delete</button>`;
                } else {
                    html += `<span class="inertia-link-cell" data-id="${article.id}"></span>`;
                    html += `<button class="btn-delete ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" data-id="${article.id}">Delete</button>`;
                }
                return html;
            },
        },
    ];

    const handleDelete = (id: number) => {
        router.delete(route('article.destroy', id), {
            onSuccess: () => dtRef.current?.reload(),
        });
    };

    const handleRestore = (id: number) => {
        router.post(route('article.restore', id), {}, {
            onSuccess: () => dtRef.current?.reload(),
        });
    };

    const handleForceDelete = (id: number) => {
        router.delete(route('article.force-delete', id), {
            onSuccess: () => dtRef.current?.reload(),
        });
    };

    const drawCallback = () => {
        document.querySelectorAll('.inertia-link-cell').forEach((cell) => {
            const id = cell.getAttribute('data-id');
            if (id) {
                const root = ReactDOM.createRoot(cell);
                root.render(
                    <Link
                        href={`/article/${id}/edit`}
                        className="inline-block ml-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-center"
                    >
                        Edit
                    </Link>
                );
            }
        });

        document.querySelectorAll('.btn-delete').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (id) handleDelete(Number(id));
            });
        });
        document.querySelectorAll('.btn-restore').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (id) handleRestore(Number(id));
            });
        });
        document.querySelectorAll('.btn-force-delete').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                if (id) handleForceDelete(Number(id));
            });
        });
    };

    const renderToggleTabs = () => {
        const tabs = ['active', 'trashed', 'all'];
        return (
            <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={clsx(
                            'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                            filter === tab
                                ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60'
                        )}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Article Management" />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Article Management</h1>
                <div className="col-md-12">
                    <HeadingSmall title="Article" description="Manage your articles here." />
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Article List</h2>
                        <Link href={route('article.create')}>
                            <Button>Create Article</Button>
                        </Link>
                    </div>
                    <div className="mb-4 flex gap-2 items-center">
                        {renderToggleTabs()}
                        <select
                            className="ml-4 border rounded px-2 py-1"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <DataTableWrapper
                        key={filter + '-' + categoryId}
                        ref={dtRef}
                        ajax={{
                            url: route('article.json'),
                            type: 'POST',
                            data: (d: Record<string, unknown>) => ({
                                ...d,
                                category_id: categoryId || undefined,
                            }),
                        }}
                        columns={columns}
                        options={{ drawCallback }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}