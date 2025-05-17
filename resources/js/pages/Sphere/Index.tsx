import { useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import HeadingSmall from '@/components/heading-small'
import { Button } from '@/components/ui/button'
import DataTableWrapper, { DataTableWrapperRef } from '@/components/datatables'
import { BreadcrumbItem } from '@/types'
import { Sphere } from '@/types/sphere'
import VirtualTourLayout from '@/layouts/VirtualTours/Layout'
import ToggleTabs from '@/components/toggle-tabs'
import CustomSelect from '@/components/select'

type VirtualTourOption = { value: number | 'all'; label: string }

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

export default function SphereIndex({
    filter: initialFilter,
    success,
    virtualTours,
}: {
    filter: string
    success?: string
    virtualTours: { id: number; name: string }[]
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Spheres', href: '/sphere' },
    ]
    const dtRef = useRef<DataTableWrapperRef>(null)
    const [filter, setFilter] = useState(initialFilter || 'active')
    const [virtualTourId, setVirtualTourId] = useState<number | 'all' | null>(null)

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
        document.querySelectorAll('.inertia-link-cell').forEach(cell => {
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
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id')
                if (id) handleDelete(Number(id))
            })
        })
        document.querySelectorAll('.btn-restore').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id')
                if (id) handleRestore(Number(id))
            })
        })
        document.querySelectorAll('.btn-force-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id')
                if (id) handleForceDelete(Number(id))
            })
        })
    }

    const virtualTourOptions: VirtualTourOption[] = [
        { value: 'all', label: 'All Virtual Tour' },
        ...virtualTours.map(vt => ({
            value: vt.id,
            label: vt.name,
        })),
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Spheres" />
            <VirtualTourLayout>
                <div className="px-4 py-6">
                    <h1 className="text-2xl font-semibold mb-4">Sphere Management</h1>
                    <HeadingSmall title="Spheres" description="Manage all spheres here." />

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Sphere List</h2>
                        <Link href={route('sphere.create')}>
                            <Button>Create Sphere</Button>
                        </Link>
                    </div>
                    <div className="mb-4 flex gap-4 justify-between">
                        <ToggleTabs tabs={['active', 'trashed', 'all']} active={filter} onChange={setFilter} />
                        <div className="w-64 z-50">
                            <CustomSelect
                                isClearable={false}
                                placeholder="Silakan pilih Virtual Tour"
                                options={virtualTourOptions}
                                value={virtualTourOptions.find(opt => opt.value === (virtualTourId ?? undefined)) || null}
                                onChange={opt => {
                                    setVirtualTourId(opt ? (opt as VirtualTourOption).value : null)
                                }}
                                menuPortalTarget={document.body}
                                styles={{
                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                }}
                            />
                        </div>
                    </div>
                    {success && (
                        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                            {success}
                        </div>
                    )}

                    <div className="w-full overflow-x-auto">
                        {virtualTourId === null ? (
                            <div className="text-gray-500 p-4">Silakan pilih Virtual Tour terlebih dahulu.</div>
                        ) : (
                            <DataTableWrapper
                                key={filter + '-' + virtualTourId}
                                ref={dtRef}
                                ajax={{
                                    url: route('sphere.json') + `?filter=${filter}`,
                                    type: 'POST',
                                    data: (d: Record<string, unknown>) => ({
                                        ...d,
                                        virtual_tour_id: virtualTourId === 'all' ? undefined : virtualTourId,
                                    }),
                                }}
                                columns={columns(filter)}
                                options={{ drawCallback }}
                            />
                        )}
                    </div>
                </div>
            </VirtualTourLayout>
        </AppLayout>
    )
}