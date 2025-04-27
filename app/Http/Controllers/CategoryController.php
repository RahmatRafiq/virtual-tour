<?php
namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $filter     = $request->query('filter', 'active');
        $categories = match ($filter) {
            'trashed' => Category::onlyTrashed()->get(),
            'all' => Category::withTrashed()->get(),
            default => Category::all(),
        };

        return Inertia::render('Category/Index', [
            'categories' => $categories,
            'filter'     => $filter,
        ]);
    }

    public function json(Request $request)
    {
        $search = $request->input('search.value', '');
        $filter = $request->input('filter', 'active');

        $query = match ($filter) {
            'trashed' => Category::onlyTrashed(),
            'all' => Category::withTrashed(),
            default => Category::query(),
        };

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $columns = ['id', 'name', 'created_at', 'updated_at'];
        if ($request->filled('order')) {
            $orderColumn = $columns[$request->order[0]['column']] ?? 'id';
            $query->orderBy($orderColumn, $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(function ($category) {
            return [
                'id'         => $category->id,
                'name'       => $category->name,
                'trashed'    => $category->trashed(),
                'created_at' => $category->created_at->toDateTimeString(),
                'updated_at' => $category->updated_at->toDateTimeString(),
                'actions'    => '',
            ];
        });

        return response()->json($data);
    }

    public function create()
    {
        $categories = Category::all();
        return Inertia::render('Category/Form', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        Category::create($request->only('name'));

        return redirect()->route('category.index')->with('success', 'Category created successfully.');
    }

    public function edit(Category $category)
    {
        $categories = Category::all();
        return Inertia::render('Category/Form', [
            'category'   => $category,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        $category->update($request->only('name'));

        return redirect()->route('category.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->route('category.index')->with('success', 'Category deleted successfully.');
    }

    public function trashed()
    {
        $categories = Category::onlyTrashed()->get();
        return Inertia::render('Category/Trashed', [
            'categories' => $categories,
        ]);
    }

    public function restore($id)
    {
        Category::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('category.index')->with('success', 'Category restored successfully.');
    }

    public function forceDelete($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->forceDelete();
        return redirect()->route('category.index')->with('success', 'Category permanently deleted successfully.');
    }
}
