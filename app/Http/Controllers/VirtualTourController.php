<?php
namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Models\Category;
use App\Models\VirtualTour;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VirtualTourController extends Controller
{
    public function index(Request $request)
    {
        $filter       = $request->query('filter', 'active');
        $virtualTours = match ($filter) {
            'trashed' => VirtualTour::onlyTrashed()->get(),
            'all' => VirtualTour::withTrashed()->get(),
            default => VirtualTour::all(),
        };

        return Inertia::render('VirtualTour/Index', [
            'virtualTours' => $virtualTours,
            'filter'       => $filter,
        ]);
    }

    public function json(Request $request)
    {
        $search = $request->input('search.value', '');
        $filter = $request->input('filter', 'active');

        $query = match ($filter) {
            'trashed' => VirtualTour::onlyTrashed(),
            'all' => VirtualTour::withTrashed(),
            default => VirtualTour::query(),
        };

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $columns = [
            'id',
            'name',
            'description',
            'created_at',
            'updated_at',
        ];

        if ($request->filled('order')) {
            $orderColumn = $columns[$request->order[0]['column']] ?? 'id';
            $query->orderBy($orderColumn, $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(function ($virtualTour) {
            return [
                'id'          => $virtualTour->id,
                'name'        => $virtualTour->name,
                'description' => $virtualTour->description,
                'trashed'     => $virtualTour->trashed(),
                'created_at'  => $virtualTour->created_at->toDateTimeString(),
                'updated_at'  => $virtualTour->updated_at->toDateTimeString(),
                'actions'     => '',
            ];
        });

        return response()->json($data);
    }
    public function show(VirtualTour $virtualTour)
    {
        
        $virtualTour->load([
            'category',
            'spheres.hotspots.targetSphere', 
            'spheres.hotspots.sphere',       
            'spheres.media',                 
        ]);

        return Inertia::render('VirtualTour/Show', [
            'virtualTour' => $virtualTour
        ]);
    }
    public function create()
    {
        $categories = Category::all();

        return Inertia::render('VirtualTour/Form', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string',
            'description' => 'nullable|string',
        ]);

        VirtualTour::create($request->only('name', 'description', 'category_id'));

        return redirect()->route('virtual-tour.index')
            ->with('success', 'Virtual Tour created successfully.');
    }

    public function edit(VirtualTour $virtualTour)
    {
        $virtualTour->load('category'); // <-- Tambah ini

        $categories   = Category::all();
        $virtualTours = VirtualTour::all();

        return Inertia::render('VirtualTour/Form', [
            'virtualTour'  => $virtualTour,
            'virtualTours' => $virtualTours,
            'categories'   => $categories,
        ]);
    }

    public function update(Request $request, VirtualTour $virtualTour)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name'        => 'required|string|max:255|unique:virtual_tours,name,' . $virtualTour->id,
            'description' => 'nullable|string',
        ]);

        $virtualTour->update($request->only('name', 'description', 'category_id'));

        return redirect()->route('virtual-tour.index')
            ->with('success', 'Virtual Tour updated successfully.');
    }

    public function destroy(VirtualTour $virtualTour)
    {
        $virtualTour->delete();
        return redirect()->route('virtual-tour.index')->with('success', 'Virtual Tour deleted successfully.');
    }

    public function trashed()
    {
        $virtualTours = VirtualTour::onlyTrashed()->get();
        return Inertia::render('VirtualTour/Trashed', [
            'virtualTours' => $virtualTours,
        ]);
    }

    public function restore($id)
    {
        VirtualTour::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('virtual-tour.index')->with('success', 'Virtual Tour restored successfully.');
    }

    public function forceDelete($id)
    {
        $virtualTour = VirtualTour::withTrashed()->findOrFail($id);
        $virtualTour->forceDelete();
        return redirect()->route('virtual-tour.index')->with('success', 'Virtual Tour permanently deleted successfully.');
    }
}
