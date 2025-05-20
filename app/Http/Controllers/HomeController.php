<?php
namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Sphere;
use App\Models\VirtualTour;
use Inertia\Inertia;
use Str;

class HomeController extends Controller
{
    public function index()
    {
        $hero = [
            'title'    => 'Welcome to Our Platform',
            'subtitle' => 'Explore articles and immersive virtual tours',
            'cta'      => [
                'label' => 'Get Started',
                'link'  => '/#sections',
            ],
        ];

        $articles = Article::with(['category', 'media'])
            ->latest('created_at')
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'id'         => $a->id,
                'title'      => $a->title,
                'slug'       => $a->slug,
                'excerpt'    => Str::limit(strip_tags($a->content), 100),
                'category'   => $a->category->name,
                'tags'       => is_array($a->tags) ? $a->tags : (json_decode($a->tags, true) ?? []),
                'coverImage' => $a->getFirstMediaUrl('cover') ?: null,
            ]);

        $tours = VirtualTour::with([
                'category',
                'spheres' => fn($q) => $q->orderBy('id')->limit(1)->with('media'),
            ])
            ->withCount('spheres')
            ->oldest('created_at')
            ->take(5)
            ->get();

        $virtualTours = $tours->map(fn($vt) => [
            'id'           => $vt->id,
            'name'         => $vt->name,
            'description'  => Str::limit($vt->description, 120),
            'category'     => $vt->category->name,
            'previewImage' => optional($vt->spheres->first())->getFirstMediaUrl('sphere_image') ?: null,
            'sphereCount'  => $vt->spheres_count,
        ]);

        return Inertia::render('Home', [
            'hero'         => $hero,
            'articles'     => $articles,
            'virtualTours' => $virtualTours,
        ]);
    }

    public function showArticle(Article $article)
    {
        $article->load('category');

        return Inertia::render('Articles/Show', [
            'article' => [
                'id'       => $article->id,
                'title'    => $article->title,
                'content'  => $article->content,
                'category' => $article->category->name,
                'tags'     => $article->tags,
                'media'    => $article->getFirstMediaUrl('default'),
            ],
        ]);
    }

    public function showVirtualTour(VirtualTour $virtualTour)
    {
        $virtualTour->load(['category', 'spheres.hotspots', 'spheres.media']);

        $spheres = $virtualTour->spheres->map(fn($s) => [
            'id'       => $s->id,
            'name'     => $s->name,
            'panorama' => $s->panorama_url,
            'hotspots' => $s->hotspots->map(fn($h) => [
                'id'       => $h->id,
                'type'     => $h->type,
                'tooltip'  => $h->tooltip,
                'targetId' => $h->target_sphere_id,
            ]),
        ]);

        return Inertia::render('Tours/Show', [
            'tour' => [
                'id'          => $virtualTour->id,
                'name'        => $virtualTour->name,
                'description' => $virtualTour->description,
                'category'    => $virtualTour->category->name,
                'spheres'     => $spheres,
            ],
        ]);
    }
}
