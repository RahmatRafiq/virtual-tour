<?php
namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Models\Sphere;
use App\Models\VirtualTour;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SphereController extends Controller
{
    public function index(Request $request)
    {
        $filter  = $request->query('filter', 'active');
        $spheres = match ($filter) {
            'trashed' => Sphere::onlyTrashed()->with('virtualTour')->get(),
            'all' => Sphere::withTrashed()->with('virtualTour')->get(),
            default => Sphere::with('virtualTour')->get(),
        };

        return Inertia::render('Sphere/Index', [
            'spheres' => $spheres,
            'filter'  => $filter,
        ]);
    }
    public function json(Request $request)
    {
        $search = $request->input('search.value', '');
        $filter = $request->input('filter', 'active');

        $query = match ($filter) {
            'trashed' => Sphere::onlyTrashed()->with('virtualTour'),
            'all' => Sphere::withTrashed()->with('virtualTour'),
            default => Sphere::with('virtualTour'),
        };

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $columns = ['id', 'name', 'description', 'created_at', 'updated_at'];
        if ($request->filled('order')) {
            $orderColumn = $columns[$request->order[0]['column']] ?? 'id';
            $query->orderBy($orderColumn, $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(function ($sphere) {
            return [
                'id'          => $sphere->id,
                'name'        => $sphere->name,
                'description' => $sphere->description,
                'virtualTour' => $sphere->virtualTour->name ?? null,
                'trashed'     => $sphere->trashed(),
                'actions'     => '',
            ];
        });

        return response()->json($data);
    }
    public function create()
    {
        $virtualTours = VirtualTour::all();
        return Inertia::render('Sphere/Form', [
            'virtualTours' => $virtualTours,
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'virtual_tour_id' => 'required|exists:virtual_tours,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'initial_yaw'     => 'nullable|numeric',
            'sphere_image'    => 'nullable|image|max:2048',
        ]);

        $sphere = Sphere::create($validatedData);

        if ($request->hasFile('sphere_image')) {
            $sphere->addMediaFromRequest('sphere_image')->toMediaCollection('sphere_image');
        }

        return redirect()->route('spheres.index')->with('success', 'Sphere berhasil dibuat.');
    }

    public function edit($id)
    {
        $sphere       = Sphere::withTrashed()->findOrFail($id);
        $virtualTours = VirtualTour::all();

        return Inertia::render('Sphere/Form', [
            'sphere'       => $sphere,
            'virtualTours' => $virtualTours,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validatedData = $request->validate([
            'virtual_tour_id' => 'required|exists:virtual_tours,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'initial_yaw'     => 'nullable|numeric',
            'sphere_image'    => 'nullable|image|max:2048',
        ]);

        $sphere = Sphere::withTrashed()->findOrFail($id);
        $sphere->update($validatedData);

        if ($request->hasFile('sphere_image')) {
            $sphere->clearMediaCollection('sphere_image');
            $sphere->addMediaFromRequest('sphere_image')->toMediaCollection('sphere_image');
        }

        return redirect()->route('spheres.index')->with('success', 'Sphere berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $sphere = Sphere::findOrFail($id);
        $sphere->delete();

        return redirect()->route('spheres.index')->with('success', 'Sphere berhasil dihapus.');
    }

    public function trashed()
    {
        $spheres = Sphere::onlyTrashed()->with('virtualTour')->get();
        return Inertia::render('Sphere/Trashed', [
            'spheres' => $spheres,
        ]);
    }

    public function restore($id)
    {
        Sphere::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('spheres.index')->with('success', 'Sphere berhasil dipulihkan.');
    }

    public function forceDelete($id)
    {
        $sphere = Sphere::onlyTrashed()->where('id', $id)->firstOrFail();
        $sphere->clearMediaCollection('sphere_image');
        $sphere->forceDelete();

        return redirect()->route('spheres.index')->with('success', 'Sphere berhasil dihapus secara permanen.');
    }
}
