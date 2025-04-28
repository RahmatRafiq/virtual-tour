import { useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import HeadingSmall from '@/components/heading-small'
import { Button } from '@/components/ui/button'
import DataTableWrapper, { DataTableWrapperRef } from '@/components/datatables'
import { BreadcrumbItem } from '@/types'
import clsx from 'clsx'
import { Sphere } from '@/types/sphere'

const columns = (filter: string) => [
    { data: 'id', title: 'ID' },
    { data: 'name', title: 'Sphere Name' },
    { data: 'virtualTour', title: 'Virtual Tour' },
    { data: 'description', title: 'Description' },
    {
        data: null,
        title: 'Actions',
        orderable: false,
        searchable: false,
        render: (_: null, __: string, row: unknown) => {
            const sph = row as Sphere
            let html = ''
            if (filter === 'trashed' || (filter === 'all' && sph.trashed)) {
                html += `<button class="btn-restore ml-2 px-2 py-1 bg-green-600 text-white rounded" data-id="${sph.id}">Restore</button>`
                html += `<button class="btn-force-delete ml-2 px-2 py-1 bg-red-600 text-white rounded" data-id="${sph.id}">Force Delete</button>`
            } else {
                html += `<span class="inertia-link-cell" data-id="${sph.id}"></span>`
                html += `<button class="btn-delete ml-2 px-2 py-1 bg-red-600 text-white rounded" data-id="${sph.id}">Delete</button>`
            }
            return html
        },
    },
]

export default function SphereIndex({ filter: initialFilter, success }: { filter: string; success?: string }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spheres', href: '/sphere' },
    ]
    const dtRef = useRef<DataTableWrapperRef>(null)
    const [filter, setFilter] = useState(initialFilter || 'active')

    const handleDelete = (id: number) => {
        router.delete(route('sphere.destroy', id), {
            onSuccess: () => dtRef.current?.reload(),
        })
    }
    const handleRestore = (id: number) => {
        router.post(route('sphere.restore', id), {}, {
            onSuccess: () => dtRef.current?.reload(),
        })
    }
    const handleForceDelete = (id: number) => {
        router.delete(route('sphere.force-delete', id), {
            onSuccess: () => dtRef.current?.reload(),
        })
    }

const drawCallback = () => {
        document.querySelectorAll('.inertia-link-cell').forEach((cell) => {
            const id = cell.getAttribute('data-id')
            if (id) {
                const root = ReactDOM.createRoot(cell)
                root.render(
                    <Link
                        href={`/sphere/${id}/edit`}
                        className="inline-block ml-2 px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                        Edit
                    </Link>
                )
            }
        })
        document.querySelectorAll('.btn-delete').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id')
                if (id) handleDelete(Number(id))
            })
        })
        document.querySelectorAll('.btn-restore').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id')
                if (id) handleRestore(Number(id))
            })
        })
        document.querySelectorAll('.btn-force-delete').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id')
                if (id) handleForceDelete(Number(id))
            })
        })
    }

    const renderTabs = () => {
        const tabs = ['active', 'trashed', 'all']
        return (
            <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={clsx(
                            'px-3 py-1 rounded-md transition',
                            filter === tab
                                ? 'bg-white shadow dark:bg-neutral-700'
                                : 'text-neutral-500 hover:bg-neutral-200'
                        )}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>
        )
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Spheres" />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Sphere Management</h1>
                <HeadingSmall title="Spheres" description="Manage all spheres here." />
                <div className="flex justify-between items-center mb-4">
                    <Link href={route('sphere.create')}>
                        <Button>Create Sphere</Button>
                    </Link>
                    {renderTabs()}
                </div>
                {success && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{success}</div>}
                <DataTableWrapper
                    key={filter}
                    ref={dtRef}
                    ajax={{
                        url: route('sphere.json') + `?filter=${filter}`,
                        type: 'POST',
                    }}
                    columns={columns(filter)}
                    options={{ drawCallback }}
                />
            </div>
        </AppLayout>
    )
}
