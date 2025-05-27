import { useState, useEffect } from 'react'
import { usePage, Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import VirtualTourLayout from '@/layouts/VirtualTours/Layout'
import SphereViewer from '@/components/SphereViewer'
import { BreadcrumbItem } from '@/types'
import type { VirtualTour } from '@/types/SphereView'

export default function Show() {
  const { virtualTour } = usePage<{ virtualTour: VirtualTour }>().props
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Virtual Tours', href: '/virtual-tour' },
    { title: virtualTour.name, href: route('virtual-tour.show', virtualTour.id) },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) setCurrentIndex(0)
  }, [mounted])

  const sphere = virtualTour.spheres?.[currentIndex]
  if (!sphere) return <div>Sphere tidak ditemukan.</div>
  if (!mounted) return <div>Loading...</div>

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={virtualTour.name} />
      <VirtualTourLayout>
        <div className="p-6 space-y-8">
          <h1 className="text-3xl font-bold">{virtualTour.name}</h1>
          <p className="text-gray-600">{virtualTour.description}</p>
          <div className="border rounded-lg overflow-hidden">
            <h2 className="bg-gray-100 px-4 py-2 text-xl">
              {sphere?.name ?? 'No Sphere'}
            </h2>
            <SphereViewer
              sphere={sphere}
              initialYaw={sphere.initial_yaw}
              onNavigateSphere={(id) => {
                const idx = virtualTour.spheres.findIndex(s => s.id === id)
                if (idx !== -1) setCurrentIndex(idx)
              }}
            />
          </div>
        </div>
      </VirtualTourLayout>
    </AppLayout>
  )
}