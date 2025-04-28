import { useEffect, useRef } from 'react'
import { type BreadcrumbItem, type SharedData } from '@/types'
import { Transition } from '@headlessui/react'
import { Head, useForm, usePage } from '@inertiajs/react'
import { FormEventHandler } from 'react'

import HeadingSmall from '@/components/heading-small'
import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/layouts/app-layout'
import Dropzoner from '@/components/dropzoner'
import VirtualTourLayout from '@/layouts/VirtualTours/Layout'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Spheres', href: '/sphere' },
]

interface SphereForm {
    virtual_tour_id: number
    name: string
    description: string
    initial_yaw: number
    'sphere_file': string[]
    'sphere_image': string[]
    [key: string]: number | string | string[]
}

export default function SphereFormPage() {
    const { sphere, virtualTours, sphere_file, sphere_image } =
        usePage<SharedData & {
            sphere: {
                id: number
                virtual_tour_id: number
                name: string
                description?: string
                initial_yaw?: number
                trashed: boolean
            } | null
            virtualTours: { id: number; name: string }[]
            sphere_file: string | null
            sphere_image: string | null
        }>().props

    const isEdit = sphere !== null

    const initialFiles = sphere_file ? [sphere_file] : []
    const initialImages = sphere_image ? [sphere_image] : []

    const { data, setData, post, put, processing, errors, recentlySuccessful } =
        useForm<SphereForm>({
            virtual_tour_id: sphere?.virtual_tour_id || virtualTours[0]?.id,
            name: sphere?.name || '',
            description: sphere?.description || '',
            initial_yaw: sphere?.initial_yaw || 0,
            sphere_file: initialFiles,
            sphere_image: initialImages,
        })

    const submit: FormEventHandler = e => {
        e.preventDefault()
        if (isEdit) {
            put(route('sphere.update', sphere!.id), { preserveScroll: true })
        } else {
            post(route('sphere.store'), { preserveScroll: true })
        }
    }

    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

    const fileRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!fileRef.current) return;
        const dz = Dropzoner(fileRef.current, 'sphere_file', {
            urlStore: route('storage.destroy'),        // ← perbaikan di sini
            urlDestroy: route('sphere.deleteFile'),
            csrf,
            acceptedFiles: '.obj,.gltf,.glb,.fbx,.jpg,.jpeg,.png',
            maxFiles: 1,
            files: data.sphere_file.map(name => ({ file_name: name, size: 0, original_url: '' })),
            kind: 'file',
        });
        dz.on('success', (_file, resp: { sphere_file_name: string; sphere_url: string }) => {
            setData('sphere_file', [resp.sphere_file_name]);
        });
        dz.on('removedfile', () => setData('sphere_file', []));
    }, [csrf]);


    useEffect(() => {
        if (!imageRef.current) return;
        const dz2 = Dropzoner(imageRef.current, 'sphere_image', {
            urlStore: route('storage.destroy'),       
            urlDestroy: route('sphere.deleteFile'),
            csrf,
            acceptedFiles: 'image/*',
            maxFiles: 1,
            files: data.sphere_image.map(name => ({ file_name: name, size: 0, original_url: '' })),
            kind: 'image',
        });
        dz2.on('success', (_file, resp: { sphere_image_name: string; sphere_image_url: string }) => {
            setData('sphere_image', [resp.sphere_image_name]);
        });
        dz2.on('removedfile', () => setData('sphere_image', []));
    }, [csrf]);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Sphere' : 'Create Sphere'} />
            <VirtualTourLayout>
                <div className="px-4 py-6">
                    <HeadingSmall
                        title={isEdit ? 'Edit Sphere' : 'New Sphere'}
                        description="Upload 3D file & 360° panorama"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="virtual_tour_id">Virtual Tour</Label>
                            <select
                                id="virtual_tour_id"
                                value={data.virtual_tour_id}
                                onChange={e => setData('virtual_tour_id', Number(e.target.value))}
                                className="border rounded p-2"
                            >
                                {virtualTours.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.virtual_tour_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Sphere Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="border rounded p-2 w-full"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="initial_yaw">Initial Yaw (°)</Label>
                            <Input
                                id="initial_yaw"
                                type="number"
                                value={data.initial_yaw}
                                onChange={e => setData('initial_yaw', parseFloat(e.target.value))}
                            />
                            <InputError message={errors.initial_yaw} />
                        </div>

                        <div className="grid gap-2">
                            <Label>3D File (OBJ/GLTF/...)</Label>
                            <div ref={fileRef} className="dropzone border-dashed border-2 rounded p-4" />
                            <InputError message={errors['sphere_file'] as string} />
                        </div>

                        <div className="grid gap-2">
                            <Label>360° Panorama Image</Label>
                            <div ref={imageRef} className="dropzone border-dashed border-2 rounded p-4" />
                            <InputError message={errors['sphere_image'] as string} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{isEdit ? 'Update' : 'Create'}</Button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <span className="text-sm text-green-600">Saved.</span>
                            </Transition>
                        </div>
                    </form>
                </div>
            </VirtualTourLayout>
        </AppLayout>
    )
}
