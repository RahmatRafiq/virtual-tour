// resources/js/Pages/VirtualTour/Index.tsx

import { useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import HeadingSmall from '@/components/heading-small'
import { Button } from '@/components/ui/button'
import DataTableWrapper, { DataTableWrapperRef } from '@/components/datatables'
import { BreadcrumbItem } from '@/types'
import clsx from 'clsx'
import { VirtualTour } from '@/types/virtualTour'

const columns = (filter: string) => [
    { data: 'id', title: 'ID' },
    { data: 'name', title: 'Name' },
    { data: 'description', title: 'Description' },
    {
        data: null,
        title: 'Actions',
        orderable: false,
        searchable: false,
        render: (_: null, __: string, row: unknown) => {
            const tour = row as VirtualTour
            let html = ''
            if (filter === 'trashed' || (filter === 'all' && tour.trashed)) {
                html += `<button class="btn-restore ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700" data-id="${tour.id}">Restore</button>`
                html += `<button class="btn-force-delete ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" data-id="${tour.id}">Force Delete</button>`
            } else {
                html += `<span class="inertia-link-cell" data-id="${tour.id}"></span>`
                html += `<button class="btn-delete ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700" data-id="${tour.id}">Delete</button>`
            }
            return html
        },
    },
]

export default function VirtualTourIndex({
    filter: initialFilter,
    success,
}: {
    filter: string
    success?: string
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Virtual Tours', href: '/virtual-tour' },
    ]
    const dtRef = useRef<DataTableWrapperRef>(null)
    const [filter, setFilter] = useState(initialFilter || 'active')

    const handleDelete = (id: number) => {
        router.delete(route('virtual-tour.destroy', id), {
            onSuccess: () => dtRef.current?.reload(),
        })
    }
    const handleRestore = (id: number) => {
        router.post(route('virtual-tour.restore', id), {}, {
            onSuccess: () => dtRef.current?.reload(),
        })
    }
    const handleForceDelete = (id: number) => {
        router.delete(route('virtual-tour.force-delete', id), {
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
                        href={`/virtual-tour/${id}/edit`}
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

    const renderToggleTabs = () => {
        const tabs = ['active', 'trashed', 'all']
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
        )
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Virtual Tours" />
                <div className="px-4 py-6">
                    <h1 className="text-2xl font-semibold mb-4">Virtual Tour Management</h1>
                    <div className="col-md-12">
                        <HeadingSmall
                            title="Virtual Tours"
                            description="Manage your virtual tours here."
                        />
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Tour List</h2>
                            <Link href={route('virtual-tour.create')}>
                                <Button>Create Tour</Button>
                            </Link>
                        </div>
                        <div className="mb-4">{renderToggleTabs()}</div>
                        {success && (
                            <div className="p-2 mb-2 bg-green-100 text-green-800 rounded">
                                {success}
                            </div>
                        )}
                        <DataTableWrapper
                            key={filter}
                            ref={dtRef}
                            ajax={{
                                url: route('virtual-tour.json') + '?filter=' + filter,
                                type: 'POST',
                            }}
                            columns={columns(filter)}
                            options={{ drawCallback }}
                        />
                    </div>
                </div>
        </AppLayout>
    )
}
