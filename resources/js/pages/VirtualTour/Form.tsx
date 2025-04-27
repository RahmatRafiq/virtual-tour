import { Head, useForm, Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Category } from '@/types/category';
import { VirtualTour } from '@/types/virtualTour';
import { Textarea } from '@headlessui/react';
import CustomSelect from '@/components/select';

interface Props {
    virtualTour?: VirtualTour;
    categories?: Category[];
}

export default function VirtualTourForm({ virtualTour, categories = [] }: Props) {
    const isEdit = !!virtualTour;

    const { data, setData, post, put, processing, errors } = useForm({
        name: virtualTour?.name || '',
        description: virtualTour?.description || '',
        category_id: virtualTour?.category_id ?? (categories.length > 0 ? categories[0].id : 1), 
    });


    const categoryOptions = categories.map((category) => ({
        label: category.name,
        value: category.id,
    }));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Virtual Tours', href: '/virtual-tour' },
        { title: isEdit ? 'Edit Tour' : 'Create Tour', href: '#' },
    ];

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(route('virtual-tour.update', virtualTour!.id));
        } else {
            post(route('virtual-tour.store'));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Virtual Tour' : 'Create Virtual Tour'} />
            <div className="px-4 py-6">
                <h1 className="text-2xl font-semibold mb-4">Virtual Tour Management</h1>
                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    {/* Sidebar */}
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav className="flex flex-col space-y-1">
                            <Button asChild variant="ghost" size="sm" className="justify-start">
                                <Link href="/virtual-tour">Tour List</Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="justify-start">
                                <Link href="/virtual-tour/trashed">Trashed Tours</Link>
                            </Button>
                        </nav>
                    </aside>
                    <div className="flex-1 md:max-w-2xl space-y-6">
                        <HeadingSmall
                            title={isEdit ? 'Edit Virtual Tour' : 'Create Virtual Tour'}
                            description="Fill in the details below"
                        />

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div>
                                <Label htmlFor="category_id">Category</Label>
                                <CustomSelect
                                    id="category_id"
                                    isMulti={false}
                                    options={categoryOptions}
                                    value={categoryOptions.find((option) => option.value === data.category_id) || null}
                                    onChange={(selected) => {
                                        setData('category_id', (selected as { value: number })?.value ?? null);
                                    }}
                                />
                                <InputError message={errors.category_id} />
                            </div>

                            <div className="flex items-center space-x-4">
                                <Button disabled={processing}>
                                    {isEdit ? 'Update Tour' : 'Create Tour'}
                                </Button>
                                <Link
                                    href={route('virtual-tour.index')}
                                    className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

