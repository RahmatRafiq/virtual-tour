import { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import HeadingSmall from '@/components/heading-small'
import { Button } from '@/components/ui/button'
import DataTableWrapper, { DataTableWrapperRef } from '@/components/datatables'
import { BreadcrumbItem } from '@/types'
import { VirtualTour } from '@/types/virtualTour'
import { Sphere } from '@/types/sphere'
import VirtualTourLayout from '@/layouts/VirtualTours/Layout'
import ToggleTabs from '@/components/toggle-tabs'
import VirtualTourCard from './card'

interface VirtualTourPaginated {
    data: VirtualTour[]
    recordsTotal: number
    recordsFiltered: number
    draw: number
    [key: string]: unknown
}

interface Props {
    filter: string
    success?: string
}

export default function SphereIndex({ filter: initialFilter, success }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Spheres', href: '/sphere' }]
    const dtRef = useRef<DataTableWrapperRef>(null)
    const [filter, setFilter] = useState(initialFilter)
    const [selectedVT, setSelectedVT] = useState<VirtualTour | null>(null)
    const [virtualTours, setVirtualTours] = useState<VirtualTour[]>([])
    const [vtLoading, setVTLoading] = useState(false)
    const [vtPage, setVTPage] = useState(1)
    const [vtTotal, setVTTotal] = useState(0)
    const [vtPerPage] = useState(10)
    const [vtSearch, setVTSearch] = useState('')

    useEffect(() => {
        setVTLoading(true)
        fetch(route('sphere.vt-json'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '',
            },
            body: JSON.stringify({
                filter,
                start: (vtPage - 1) * vtPerPage,
                length: vtPerPage,
                draw: vtPage,
                search: { value: vtSearch },
            }),
        })
            .then(res => res.json())
            .then((data: VirtualTourPaginated) => {
                setVirtualTours(data.data)
                setVTTotal(data.recordsFiltered)
                setVTLoading(false)
            })
            .catch(() => setVTLoading(false))
    }, [filter, vtPage, vtPerPage, vtSearch])

    const handleDelete = (id: number) =>
        router.delete(route('sphere.destroy', id), { onSuccess: () => dtRef.current?.reload() })
    const handleRestore = (id: number) =>
        router.post(route('sphere.restore', id), {}, { onSuccess: () => dtRef.current?.reload() })
    const handleForceDelete = (id: number) =>
        router.delete(route('sphere.force-delete', id), { onSuccess: () => dtRef.current?.reload() })

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
            render: (_: null, __: string, row: Sphere) => {
                if (filter === 'trashed' || (filter === 'all' && row.trashed)) {
                    return `
            <button class="btn-restore bg-green-600 px-2 py-1 rounded text-white" data-id="${row.id}">Restore</button>
            <button class="btn-force-delete bg-red-600 px-2 py-1 rounded text-white" data-id="${row.id}">Force Delete</button>
          `
                }
                return `
          <span class="inertia-link-cell" data-id="${row.id}"></span>
          <button class="btn-delete bg-red-600 px-2 py-1 rounded text-white" data-id="${row.id}">Delete</button>
        `
            },
        },
    ]

    const renderPagination = () => {
        const totalPages = Math.ceil(vtTotal / vtPerPage)
        if (totalPages <= 1) return null
        return (
            <div className="flex gap-2 mt-4">
                <Button
                    variant="outline"
                    disabled={vtPage === 1}
                    onClick={() => setVTPage(vtPage - 1)}
                >
                    Prev
                </Button>
                <span className="px-2 py-1">Page {vtPage} of {totalPages}</span>
                <Button
                    variant="outline"
                    disabled={vtPage === totalPages}
                    onClick={() => setVTPage(vtPage + 1)}
                >
                    Next
                </Button>
            </div>
        )
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Spheres" />
            <VirtualTourLayout>
                <div className="px-4 py-6">
                    <h1 className="text-2xl font-semibold mb-4">Sphere Management</h1>
                    <HeadingSmall title="Spheres" description="Manage all spheres here." />
                    {!selectedVT && (
                        <div className="mb-4">
                            <input
                                type="text"
                                className="border px-2 py-1 rounded w-full md:w-1/3"
                                placeholder="Search Virtual Tour..."
                                value={vtSearch}
                                onChange={e => {
                                    setVTPage(1)
                                    setVTSearch(e.target.value)
                                }}
                            />
                        </div>
                    )}

                    {!selectedVT ? (
                        <>
                            {vtLoading ? (
                                <div>Loading...</div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(Array.isArray(virtualTours) ? virtualTours : []).map(vt => (
                                            <VirtualTourCard
                                                key={vt.id}
                                                vt={vt}
                                                onClick={setSelectedVT}
                                            />
                                        ))}
                                    </div>
                                    {renderPagination()}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <ToggleTabs tabs={['active', 'trashed', 'all']} active={filter} onChange={setFilter} />
                            </div>
                            <Button variant="link" onClick={() => setSelectedVT(null)}>
                                ← Back to Tours
                            </Button>

                            <h2 className="text-xl font-semibold my-4">
                                Spheres in “{selectedVT.name}”
                            </h2>

                            <DataTableWrapper
                                ref={dtRef}
                                key={`${selectedVT.id}-${filter}`}
                                ajax={{
                                    url: route('sphere.json'),
                                    type: 'POST',
                                    data: (d: Record<string, unknown>) => {
                                        d.filter = filter
                                        d.virtual_tour_id = selectedVT.id
                                    },
                                }}
                                columns={columns(filter) as {
                                    data: string | number | null
                                    title: string
                                    render?: (data: string | number | boolean | null, type: string, row: unknown, meta: unknown) => string
                                    orderable?: boolean
                                    searchable?: boolean
                                }[]}
                                options={{
                                    processing: true,
                                    order: [[0, 'asc']],
                                    drawCallback: () => {
                                        document.querySelectorAll('.inertia-link-cell').forEach(cell => {
                                            const id = cell.getAttribute('data-id')
                                            if (id) {
                                                ReactDOM.createRoot(cell).render(
                                                    <Link
                                                        href={`/sphere/${id}/edit`}
                                                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                                                    >
                                                        Edit
                                                    </Link>
                                                )
                                            }
                                        })
                                        document.querySelectorAll('.btn-delete').forEach(btn =>
                                            btn.addEventListener('click', () => handleDelete(+btn.getAttribute('data-id')!))
                                        )
                                        document.querySelectorAll('.btn-restore').forEach(btn =>
                                            btn.addEventListener('click', () => handleRestore(+btn.getAttribute('data-id')!))
                                        )
                                        document.querySelectorAll('.btn-force-delete').forEach(btn =>
                                            btn.addEventListener('click', () => handleForceDelete(+btn.getAttribute('data-id')!))
                                        )
                                    },
                                }}
                            />
                        </>
                    )}

                    {success && (
                        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">{success}</div>
                    )}
                </div>
            </VirtualTourLayout>
        </AppLayout>
    )
}