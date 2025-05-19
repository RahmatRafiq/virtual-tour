<?php
namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Helpers\MediaLibrary;
use App\Models\Article;
use App\Models\Category;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Str;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $filter   = $request->query('filter', 'active');
        $articles = match ($filter) {
            'trashed' => Article::onlyTrashed()->with('category')->get(),
            'all' => Article::withTrashed()->with('category')->get(),
            default => Article::with('category')->get(),
        };

        $categories = Category::where('type', 'article')->select('id', 'name')->get();

        return Inertia::render('Article/Index', [
            'articles'   => $articles,
            'filter'     => $filter,
            'categories' => $categories]);
    }

    public function json(Request $request)
    {
        $search     = $request->input('search.value', '');
        $filter     = $request->input('filter', 'active');
        $categoryId = $request->input('category_id');

        $query = match ($filter) {
            'trashed' => Article::onlyTrashed()->with('category'),
            'all' => Article::withTrashed()->with('category'),
            default => Article::with('category'),
        };

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($search) {
            $query->where(fn($q) =>
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('tags', 'like', "%{$search}%")
            );
        }

        $columns = ['id', 'title', 'slug', 'category_id', 'created_at', 'updated_at'];
        if ($request->filled('order')) {
            $col = $columns[$request->order[0]['column']] ?? 'id';
            $query->orderBy($col, $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(fn($article) => [
            'id'         => $article->id,
            'title'      => $article->title,
            'slug'       => $article->slug,
            'category'   => optional($article->category)->name ?? '-',
            'tags'       => $article->tags,
            'trashed'    => $article->trashed(),
            'created_at' => $article->created_at?->toDateTimeString(),
            'updated_at' => $article->updated_at?->toDateTimeString(),
            'actions'    => '',
        ]);

        return response()->json($data);
    }

    public function create()
    {
        $categories = Category::where('type', 'article')->get();

        return Inertia::render('Article/Form', [
            'categories' => $categories,
            'article'    => null,
            'cover'      => null,
        ]);
    }

    public function store(Request $request)
    {
        if (! $request->filled('slug') && $request->filled('title')) {
            $request->merge([
                'slug' => Str::slug($request->input('title')),
            ]);
        }
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title'       => 'required|string|max:255',
            'slug'        => 'required|string|max:255|unique:articles,slug',
            'content'     => 'required|string',
            'tags'        => 'nullable|array',
            'cover'       => 'array|max:1',
        ]);

        $validated['tags'] = $request->filled('tags') ? json_encode($request->input('tags')) : null;

        DB::beginTransaction();
        try {
            $article = Article::create($validated);

            if ($request->has('cover')) {
                $covers = $request->input('cover');
                if (is_array($covers) && count($covers) > 0) {
                    $last = end($covers);
                    $request->merge(['cover' => [$last]]);
                }
                MediaLibrary::put(
                    $article,
                    'cover',
                    $request,
                    'cover'
                );
            }

            DB::commit();
            return redirect()->route('article.index')->with('success', 'Article berhasil dibuat.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Store Article error: ' . $e->getMessage());
            return back()->withErrors('error', 'Gagal membuat article.');
        }
    }

    public function edit($id)
    {
        $article    = Article::withTrashed()->with(['media'])->findOrFail($id);
        $cover      = $article->getMedia('cover')->first();
        $categories = Category::where('type', 'article')->get();

        return Inertia::render('Article/Form', [
            'categories' => $categories,
            'article'    => $article,
            'cover'      => $cover,
        ]);
    }

    public function update(Request $request, $id)
    {
        $article = Article::withTrashed()->findOrFail($id);

        if (! $request->filled('slug') && $request->filled('title')) {
            $request->merge([
                'slug' => Str::slug($request->input('title')),
            ]);
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title'       => 'required|string|max:255',
            'slug'        => 'required|string|max:255|unique:articles,slug,' . $article->id,
            'content'     => 'required|string',
            'tags'        => 'nullable|array',
            'cover'       => 'array|max:1',
        ]);

        $validated['tags'] = $request->filled('tags') ? json_encode($request->input('tags')) : null;

        DB::beginTransaction();
        try {
            $article->fill($validated)->save();

            if ($request->has('cover') && is_array($request->input('cover')) && count($request->input('cover')) > 0) {
                $covers = $request->input('cover');
                $last   = end($covers);
                $currentCover = $article->getMedia('cover')->first();
                if (! $currentCover || $currentCover->file_name !== $last) {
                    $request->merge(['cover' => [$last]]);
                    $article->clearMediaCollection('cover');
                    MediaLibrary::put(
                        $article,
                        'cover',
                        $request,
                        'cover'
                    );
                }
            }

            DB::commit();
            return redirect()->route('article.index')->with('success', 'Article berhasil diperbarui.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Update Article error: ' . $e->getMessage());
            return back()->withErrors('error', 'Gagal memperbarui article.');
        }
    }

    public function destroy($id)
    {
        Article::findOrFail($id)->delete();
        return redirect()->route('article.index')->with('success', 'Article dihapus.');
    }

    public function trashed()
    {
        $articles = Article::onlyTrashed()->with('category')->get();
        return Inertia::render('Article/Trashed', compact('articles'));
    }

    public function restore($id)
    {
        Article::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('article.index')->with('success', 'Article dipulihkan.');
    }

    public function forceDelete($id)
    {
        $article = Article::onlyTrashed()->where('id', $id)->firstOrFail();
        $article->clearMediaCollection('cover');
        $article->forceDelete();

        return redirect()->route('article.index')->with('success', 'Article dihapus permanen.');
    }
}
