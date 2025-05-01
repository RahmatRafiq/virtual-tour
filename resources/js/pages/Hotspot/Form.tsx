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
import { Hotspot } from '@/types/hotspot';

export default function HotspotFormPage() {
    const { hotspot, spheres } = usePage<
        SharedData & { hotspot?: Hotspot; spheres?: Array<{ id: number; name: string }> }
    >().props;

    const isEdit = !!hotspot;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Hotspots', href: route('hotspot.index') },
        { title: isEdit ? 'Edit Hotspot' : 'Create Hotspot', href: '#' },
    ];

    const { data, setData, post, put, processing, errors, recentlySuccessful } =
        useForm({
            sphere_id: hotspot?.sphere_id || (spheres?.[0]?.id ?? 0),
            type: hotspot?.type || '',
            target_sphere_id: hotspot?.target_sphere_id || null,
            yaw: hotspot?.yaw || 0,
            pitch: hotspot?.pitch || 0,
            tooltip: hotspot?.tooltip || '',
            content: hotspot?.content || '',
        });

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
                                options={spheres?.map((sphere) => ({
                                    value: sphere.id,
                                    label: sphere.name,
                                })) || []}
                                value={
                                    spheres
                                        ?.map((sphere) => ({ value: sphere.id, label: sphere.name }))
                                        .find((opt) => opt.value === data.sphere_id) || null
                                }
                                onChange={(selected) => {
                                    setData(
                                        'sphere_id',
                                        (selected as { value: number })?.value ?? 0
                                    );
                                }}
                            />
                            <InputError message={errors.sphere_id} />
                        </div>

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
                                    ].find((opt) => opt.value === data.type) || null
                                }
                                onChange={(selected) => {
                                    setData('type', (selected as { value: string })?.value ?? '');
                                }}
                            />
                            <InputError message={errors.type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="target_sphere_id">Target Sphere</Label>
                            <CustomSelect
                                id="target_sphere_id"
                                isMulti={false}
                                options={spheres?.map((sphere) => ({
                                    value: sphere.id,
                                    label: sphere.name,
                                })) || []}
                                value={
                                    spheres
                                        ?.map((sphere) => ({ value: sphere.id, label: sphere.name }))
                                        .find((opt) => opt.value === data.target_sphere_id) || null
                                }
                                onChange={(selected) => {
                                    setData(
                                        'target_sphere_id',
                                        (selected as { value: number })?.value ?? null
                                    );
                                }}
                            />
                            <InputError message={errors.target_sphere_id} />
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
