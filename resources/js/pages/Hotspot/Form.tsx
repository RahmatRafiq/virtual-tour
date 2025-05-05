import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import VirtualTourLayout from '@/layouts/VirtualTours/Layout';
import CustomSelect from '@/components/select';
import { Viewer, PluginConstructor } from '@photo-sphere-viewer/core';
import { createRoot } from 'react-dom/client';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import HotspotMarker from '@/components/HotspotMarker';

export default function HotspotFormPage() {
    type NewType = SharedData & {
        hotspot?: {
            id: number;
            sphere_id: number;
            type: string;
            yaw: number;
            pitch: number;
            tooltip: string;
            content: string;
        };
        spheres: Array<{
            id: number;
            name: string;
            sphere_file: string;
            sphere_image: string; // Additional property for sphere image
        }>;
    };

    const { hotspot, spheres } = usePage<
        NewType
    >().props;

    const isEdit = !!hotspot;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hotspots', href: route('hotspot.index') },
        { title: isEdit ? 'Edit Hotspot' : 'Create Hotspot', href: '#' },
    ];

    const { data, setData, post, put, processing, errors, recentlySuccessful } = useForm({
        sphere_id: hotspot?.sphere_id || (spheres[0]?.id ?? 0),
        type: hotspot?.type || '',
        yaw: hotspot?.yaw || 0,
        pitch: hotspot?.pitch || 0,
        tooltip: hotspot?.tooltip || '',
        content: hotspot?.content || '',
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);

    useEffect(() => {
        if (!containerRef.current || !spheres) return;

        const sphere = spheres.find((s) => s.id === data.sphere_id);
        if (!sphere || !sphere.sphere_file) return;

        const viewer = new Viewer({
            container: containerRef.current,
            panorama: sphere.sphere_file,
            plugins: [[MarkersPlugin as unknown as PluginConstructor, {}]],
        });
        viewerRef.current = viewer;

        const markersPlugin = viewer.getPlugin(MarkersPlugin as unknown as PluginConstructor) as unknown as MarkersPlugin;

        // Tambahkan marker ke posisi tertentu
        if (markersPlugin) {
            const markerElement = document.createElement('div');
            createRoot(markerElement).render(
                <HotspotMarker
                    hotspot={{
                        id: 1,
                        type: 'info',
                        yaw: data.yaw,
                        pitch: data.pitch,
                        tooltip: data.tooltip || 'This is a custom marker!',
                        content: data.content || 'This is the content of the marker.',
                        target_sphere: null,
                        sphere: sphere,
                    }}
                />
            );

            markersPlugin.addMarker({
                id: 'custom-marker',
                element: markerElement,
                position: { yaw: (data.yaw * Math.PI) / 180, pitch: (data.pitch * Math.PI) / 180 },
                anchor: 'center bottom',
            });
        }

        viewer.addEventListener('click', (e) => {
            const position = (e as { position?: { yaw: number; pitch: number } }).position; // Explicitly define the type for position
            if (position) {
                const { yaw, pitch } = position;
                setData((prevData) => ({
                    ...prevData,
                    yaw: parseFloat(((yaw * 180) / Math.PI).toFixed(2)),
                    pitch: parseFloat(((pitch * 180) / Math.PI).toFixed(2)),
                }));
            }
        });

        return () => viewer.destroy();
    }, [data.sphere_id, spheres, data.yaw, data.pitch, data.content, data.tooltip, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('hotspot.update', hotspot!.id), { preserveScroll: true });
        } else {
            post(route('hotspot.store'), { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Hotspot' : 'Create Hotspot'} />
            <VirtualTourLayout>
                <div className="px-4 py-6">
                    <HeadingSmall
                        title={isEdit ? 'Edit Hotspot' : 'New Hotspot'}
                        description="Configure hotspot details"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="sphere_id">Sphere</Label>
                            <CustomSelect
                                id="sphere_id"
                                isMulti={false}
                                options={spheres.map((sphere) => ({
                                    value: sphere.id,
                                    label: sphere.name,
                                }))}
                                value={spheres
                                    .map((sphere) => ({
                                        value: sphere.id,
                                        label: sphere.name,
                                    }))
                                    .find((opt) => opt.value === data.sphere_id) || null}
                                onChange={(selected) => {
                                    setData('sphere_id', (selected as { value: number })?.value ?? 0);
                                }}
                            />
                            <InputError message={errors.sphere_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Sphere Viewer</Label>
                            <div
                                ref={containerRef}
                                style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
                            />
                            <p className="text-sm text-gray-500">
                                Click on the sphere to set yaw and pitch values.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="yaw">Yaw (°)</Label>
                            <Input
                                id="yaw"
                                type="number"
                                min="-180"
                                max="180"
                                step="0.1"
                                value={data.yaw}
                                onChange={(e) => setData('yaw', Number(e.target.value))}
                            />
                            <InputError message={errors.yaw} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="pitch">Pitch (°)</Label>
                            <Input
                                id="pitch"
                                type="number"
                                min="-90"
                                max="90"
                                step="0.1"
                                value={data.pitch}
                                onChange={(e) => setData('pitch', Number(e.target.value))}
                            />
                            <InputError message={errors.pitch} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tooltip">Tooltip</Label>
                            <Input
                                id="tooltip"
                                value={data.tooltip}
                                onChange={(e) => setData('tooltip', e.target.value)}
                            />
                            <InputError message={errors.tooltip} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="content">Content</Label>
                            <textarea
                                id="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                className="border rounded p-2 w-full h-24"
                            />
                            <InputError message={errors.content} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                {isEdit ? 'Update Hotspot' : 'Create Hotspot'}
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
