import { useEffect, useRef } from 'react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import VirtualTourLayout from '@/layouts/VirtualTours/Layout';
import CustomSelect from '@/components/select';
import Dropzoner from '@/components/dropzoner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Spheres', href: '/sphere' },
];

interface SphereForm {
    virtual_tour_id: number;
    name: string;
    description: string;
    initial_yaw: number;
    sphere_file: string[];
    sphere_image: string[];
    [key: string]: number | string | string[];
}

export default function SphereFormPage() {
    const { sphere, virtualTours } = usePage<
        SharedData & {
            sphere?: {
                id: number;
                virtual_tour_id: number;
                name: string;
                description?: string;
                initial_yaw?: number;
                trashed: boolean;
                sphere_file: string | null;
                sphere_image: string | null;
                media?: { collection_name: string; original_url: string }[];
            };
            virtualTours: { id: number; name: string }[];
        }
    >().props;

    const isEdit = !!sphere;

    const initialSphereFile = sphere?.media?.filter(m => m.collection_name === 'sphere_file').map(m => m.original_url) || [];
    const initialSphereImage = sphere?.media?.filter(m => m.collection_name === 'sphere_image').map(m => m.original_url) || [];


    const { data, setData, post, put, processing, errors, recentlySuccessful } =
        useForm<SphereForm>({
            virtual_tour_id: sphere?.virtual_tour_id || virtualTours[0]?.id || 0,
            name: sphere?.name || '',
            description: sphere?.description || '',
            initial_yaw: sphere?.initial_yaw || 0,
            sphere_file: initialSphereFile,
            sphere_image: initialSphereImage,
        });
    console.log('Sphere:', sphere);
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('sphere.update', sphere!.id), { preserveScroll: true });
        } else {
            post(route('sphere.store'), { preserveScroll: true });
        }
    };

    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const fileRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (fileRef.current) {
            const initialFiles = sphere?.media
                ?.filter(m => m.collection_name === 'sphere_file')
                .map(m => ({
                    original_url: m.original_url,
                    file_name: m.original_url.split('/').pop() || 'unknown',
                    size: 0,
                })) || [];

            console.log('Initial Files:', initialFiles);

            const dz = Dropzoner(fileRef.current, 'sphere_file', {
                urlStore: route('storage.destroy'),
                urlDestroy: route('sphere.deleteFile'),
                csrf,
                acceptedFiles: 'image/*',
                maxFiles: 1,
                files: initialFiles,
                kind: 'file',
                paramName: 'sphere_file'
            });

            dz.on('success', (file, response: { name: string }) => {
                setData('sphere_file', [response.name]);
            });

            dz.on('removedfile', () => {
                setData('sphere_file', []);
            });

            return () => {
                dz.destroy();
            };
        }
    }, [csrf, sphere?.sphere_file]);

    useEffect(() => {
        if (imageRef.current) {
            const initialImages = sphere?.media
                ?.filter(m => m.collection_name === 'sphere_image')
                .map(m => ({
                    original_url: m.original_url,
                    file_name: m.original_url.split('/').pop() || 'unknown',
                    size: 0,
                })) || [];

            const dz = Dropzoner(imageRef.current, 'sphere_image', {
                urlStore: route('storage.destroy'),
                urlDestroy: route('sphere.deleteFile'),
                csrf,
                acceptedFiles: 'image/*',
                maxFiles: 1,
                files: initialImages,
                kind: 'image',
                paramName: 'sphere_image'
            });

            dz.on('success', (file, response: { name: string }) => {
                setData('sphere_image', [response.name]);
            });

            dz.on('removedfile', () => {
                setData('sphere_image', []);
            });

            return () => {
                dz.destroy();
            };
        }
    }, [csrf, sphere?.sphere_image]);

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
                            <CustomSelect
                                id="virtual_tour_id"
                                isMulti={false}
                                options={virtualTours.map((tour) => ({ value: tour.id, label: tour.name }))}
                                value={virtualTours
                                    .map((tour) => ({ value: tour.id, label: tour.name }))
                                    .find((option) => option.value === data.virtual_tour_id) || null}
                                onChange={(selected) => {
                                    setData('virtual_tour_id', (selected as { value: number })?.value ?? 0);
                                }}
                            />
                            <InputError message={errors.virtual_tour_id as string} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Sphere Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name as string} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                className="border rounded p-2 w-full h-24"
                            />
                            <InputError message={errors.description as string} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="initial_yaw">Initial Yaw (°)</Label>
                            <Input
                                id="initial_yaw"
                                type="number"
                                min="0"
                                max="360"
                                step="0.1"
                                value={data.initial_yaw}
                                onChange={e => setData('initial_yaw', Number(e.target.value))}
                            />
                            <InputError message={errors.initial_yaw as string} />
                        </div>

                        <div className="grid gap-2">
                            <Label>3D File (Format: OBJ, GLTF, GLB, FBX)</Label>
                            <div
                                ref={fileRef}
                                className="dropzone border-dashed border-2 rounded p-4 dark:text-black"
                            />
                            <InputError message={errors.sphere_file as string} />
                        </div>

                        <div className="grid gap-2">
                            <Label>360° Panorama Image</Label>
                            <div
                                ref={imageRef}
                                className="dropzone border-dashed border-2 rounded p-4 dark:text-black"
                            />
                            <InputError message={errors.sphere_image as string} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                {isEdit ? 'Update Sphere' : 'Create Sphere'}
                            </Button>
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
    );
}