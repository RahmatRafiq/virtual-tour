import { type BreadcrumbItem, type SharedData } from '@/types';
import { ClickEvent, Hotspot, MarkersPluginWithEvents, Sphere } from '@/types/SphereView';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

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
    type VirtualTour = {
        id: number;
        name: string;
    };
    type SphereWithVirtualTour = Sphere & { virtual_tour_id: number };

    type NewType = SharedData & {
        hotspot?: Hotspot;
        spheres: SphereWithVirtualTour[];
        virtualTours: VirtualTour[];
    };

    const { hotspot, spheres, virtualTours } = usePage<NewType>().props as {
        hotspot?: Omit<Hotspot, 'sphere'> & { sphere?: SphereWithVirtualTour };
        spheres: SphereWithVirtualTour[];
        virtualTours: VirtualTour[];
    };

    const isEdit = !!hotspot;

    const initialVirtualTourId = isEdit
        ? hotspot?.sphere?.virtual_tour_id ?? null
        : null;
    const initialSphereId = isEdit
        ? hotspot?.sphere?.id ?? null
        : null;

    const [virtualTourId, setVirtualTourId] = useState<number | null>(initialVirtualTourId);
    const filteredSpheres = virtualTourId
        ? spheres.filter(s => s.virtual_tour_id === virtualTourId)
        : [];

    const { data, setData, post, put, processing, errors, recentlySuccessful } = useForm({
        sphere_id: initialSphereId ?? 0,
        type: hotspot?.type || '',
        yaw: hotspot?.yaw || 0,
        pitch: hotspot?.pitch || 0,
        tooltip: hotspot?.tooltip || '',
        content: hotspot?.content || '',
    });

    useEffect(() => {
        if (
            virtualTourId &&
            !filteredSpheres.some(s => s.id === data.sphere_id)
        ) {
            setData('sphere_id', filteredSpheres[0]?.id ?? 0);
        }
        if (!virtualTourId) {
            setData('sphere_id', 0);
        }
    }, [virtualTourId]);

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

        const markersPlugin = viewer.getPlugin(MarkersPlugin as unknown as PluginConstructor) as unknown as MarkersPluginWithEvents;

        if (markersPlugin) {
            markersPlugin.clearMarkers();

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

        viewer.addEventListener('click', (e: ClickEvent & { type: "click" }) => {
            const position = e.position;
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hotspots', href: route('hotspot.index') },
        { title: isEdit ? 'Edit Hotspot' : 'Create Hotspot', href: '#' },
    ];

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
                            <Label htmlFor="type">Type</Label>
                            <CustomSelect
                                id="type"
                                isMulti={false}
                                options={[
                                    { value: 'navigation', label: 'Navigation' },
                                    { value: 'info', label: 'Info' },
                                ]}
                                value={
                                    [
                                        { value: 'navigation', label: 'Navigation' },
                                        { value: 'info', label: 'Info' },
                                    ].find(opt => opt.value === data.type) || null
                                }
                                onChange={selected => setData('type', (selected as { value: string })?.value ?? '')}
                                placeholder="Pilih tipe hotspot"
                            />
                            <InputError message={errors.type} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="virtual_tour_id">Virtual Tour</Label>
                            <CustomSelect
                                id="virtual_tour_id"
                                isMulti={false}
                                options={virtualTours.map(vt => ({
                                    value: vt.id,
                                    label: vt.name,
                                }))}
                                value={
                                    virtualTours
                                        .map(vt => ({ value: vt.id, label: vt.name }))
                                        .find(opt => opt.value === virtualTourId) || null
                                }
                                onChange={selected => {
                                    const vtId = (selected as { value: number })?.value ?? null;
                                    setVirtualTourId(vtId);
                                }}
                                placeholder="Pilih Virtual Tour"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sphere_id">Sphere</Label>
                            <CustomSelect
                                id="sphere_id"
                                isMulti={false}
                                options={filteredSpheres.map((sphere) => ({
                                    value: sphere.id,
                                    label: sphere.name,
                                }))}
                                value={
                                    filteredSpheres
                                        .map((sphere) => ({
                                            value: sphere.id,
                                            label: sphere.name,
                                        }))
                                        .find((opt) => opt.value === data.sphere_id) || null
                                }
                                onChange={(selected) => {
                                    setData('sphere_id', (selected as { value: number })?.value ?? 0);
                                }}
                                isDisabled={!virtualTourId}
                                placeholder="Pilih Sphere"
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
