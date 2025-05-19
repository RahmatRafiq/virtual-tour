import { useEffect, useRef } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import CustomSelect from '@/components/select';
import Dropzoner from '@/components/dropzoner';

type ArticleFormProps = {
    article?: {
        id: number;
        category_id: number;
        title: string;
        slug: string;
        content: string;
        tags: string[] | string;
        media?: { collection_name: string; original_url: string }[];
    };
    categories: { id: number; name: string }[];
    cover?: {
        original_url: string
        file_name: string
        size: number
    };
};

export default function ArticleFormPage() {
    const { article, categories, cover } = usePage<ArticleFormProps>().props;
    const isEdit = !!article;

    const breadcrumbs = [
        { title: 'Articles', href: route('article.index') },
        { title: isEdit ? 'Edit Article' : 'Create Article', href: '#' },
    ];



    const initialCover =
        cover
            ? [{
                original_url: cover.original_url,
                file_name: cover.file_name,
                size: cover.size || 0,
            }]
            : [];

    const { data, setData, post, put, processing, errors, recentlySuccessful } = useForm({
        category_id: article?.category_id || categories[0]?.id || 0,
        title: article?.title || '',
        slug: article?.slug || '',
        content: article?.content || '',
        tags: article?.tags ? (Array.isArray(article.tags) ? article.tags : JSON.parse(article.tags)) : [],
        cover: initialCover.map(f => f.file_name),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('article.update', article.id), { preserveScroll: true });
        } else {
            post(route('article.store'), { preserveScroll: true });
        }
    };

    const csrf =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '';

    const coverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!coverRef.current) return;

        const dz = Dropzoner(coverRef.current, 'cover', {
            urlStore: route('storage.store'),
            csrf,
            acceptedFiles: 'image/*',
            maxFiles: 1,
            files: initialCover,
            kind: 'image',
            paramName: 'cover',
        });

        dz.on('success', (_file, response: { name: string }) => {
            setData('cover', [response.name]);
        });

        dz.on('error', (file: Dropzone.DropzoneFile,) => {
            dz.removeFile(file);
        });

        dz.on('removedfile', (file: { name: string }) => {
            setData('cover',
                (data.cover as string[]).filter((name: string) => name !== file.name)
            );

            fetch(route('storage.destroy'), {
                method: 'DELETE',
                headers: { 'X-CSRF-TOKEN': csrf, 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name }),
            });
        });

        return () => {
            dz.destroy();
        };
    }, [csrf, article?.media]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Article' : 'Create Article'} />
            <div className="px-4 py-6">
                <HeadingSmall
                    title={isEdit ? 'Edit Article' : 'New Article'}
                    description="Fill in the article details"
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="category_id">Category</Label>
                        <CustomSelect
                            id="category_id"
                            isMulti={false}
                            options={categories.map((cat) => ({
                                value: cat.id,
                                label: cat.name,
                            }))}
                            value={
                                categories
                                    .map((cat) => ({ value: cat.id, label: cat.name }))
                                    .find((opt) => opt.value === data.category_id) || null
                            }
                            onChange={(selected) => {
                                setData(
                                    'category_id',
                                    (selected as { value: number })?.value ?? 0
                                );
                            }}
                        />
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        <InputError message={errors.title} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <textarea
                            id="content"
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            className="border rounded p-2 w-full h-32"
                        />
                        <InputError message={errors.content} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            value={data.tags.join(', ')}
                            onChange={(e) => setData('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        />
                        <InputError message={errors.tags} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Cover Image</Label>
                        <div
                            ref={coverRef}
                            className="dropzone border-dashed border-2 rounded p-4 dark:text-black"
                        />
                        <InputError message={errors.cover} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>
                            {isEdit ? 'Update Article' : 'Create Article'}
                        </Button>
                        {recentlySuccessful && (
                            <span className="text-sm text-green-600">Saved.</span>
                        )}
                        <Link
                            href={route('article.index')}
                            className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/70"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}