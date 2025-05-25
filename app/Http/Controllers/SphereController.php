<?php
namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Helpers\MediaLibrary;
use App\Models\Sphere;
use App\Models\VirtualTour;
use DB;
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
            'spheres'      => $spheres,
            'filter'       => $filter,
            'virtualTours' => VirtualTour::select('id', 'name')->get(),
        ]);
    }
    public function json(Request $request)
    {
        $search        = $request->input('search.value', '');
        $filter        = $request->input('filter', 'active');
        $virtualTourId = $request->input('virtual_tour_id');

        $query = match ($filter) {
            'trashed' => Sphere::onlyTrashed()->with('virtualTour'),
            'all' => Sphere::withTrashed()->with('virtualTour'),
            default => Sphere::with('virtualTour'),
        };

        if ($virtualTourId) {
            $query->where('virtual_tour_id', $virtualTourId);
        }

        if ($search) {
            $query->where(fn($q) =>
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
            );
        }
        $columns = ['id', 'name', 'description', 'created_at', 'updated_at'];
        if ($request->filled('order')) {
            $col = $columns[$request->order[0]['column']] ?? 'id';
            $query->orderBy($col, $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(fn($sphere) => [
            'id'          => $sphere->id,
            'name'        => $sphere->name,
            'description' => $sphere->description,
            'virtualTour' => optional($sphere->virtualTour)->name ?? '-',
            'trashed'     => $sphere->trashed(),
            'actions'     => '',
        ]);

        return response()->json($data);
    }
    public function create()
    {
        return Inertia::render('Sphere/Form', [
            'virtualTours' => VirtualTour::all(),
            'sphere'       => null,
            'sphere_file'  => null,
            'sphere_image' => null,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'virtual_tour_id' => 'required|exists:virtual_tours,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'initial_yaw'     => 'nullable|numeric',
            'sphere_file'     => 'array',
            'sphere_file.*'   => 'string|max:255',
            'sphere_image'    => 'array',
            'sphere_image.*'  => 'string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $sphere = Sphere::create($validated);

            if ($request->has('sphere_file')) {
                $files = $request->input('sphere_file');
                if (is_array($files) && count($files) > 0) {
                    $last = end($files);
                    $request->merge(['sphere_file' => [$last]]);
                }
                MediaLibrary::put($sphere, 'sphere_file', $request, 'sphere_file');
            }

            if ($request->has('sphere_image')) {
                $imgs = $request->input('sphere_image');
                if (is_array($imgs) && count($imgs) > 0) {
                    $lastImg = end($imgs);
                    $request->merge(['sphere_image' => [$lastImg]]);
                }
                MediaLibrary::put($sphere, 'sphere_image', $request, 'sphere_image');
            }

            DB::commit();
            return redirect()->route('sphere.index')->with('success', 'Sphere berhasil dibuat.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Store Sphere error: ' . $e->getMessage());
            return back()->withErrors('error', 'Gagal membuat sphere.');
        }
    }

    public function edit($id)
    {
        $sphere      = Sphere::withTrashed()->with(['media'])->findOrFail($id);
        $sphereImage = $sphere->getMedia('sphere_image')->first();
        $sphereFile  = $sphere->getMedia('sphere_file')->first();

        return Inertia::render('Sphere/Form', [
            'virtualTours' => VirtualTour::all(),
            'sphere'       => $sphere,
            'sphereImage'  => $sphereImage,
            'sphereFile'   => $sphereFile,
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'virtual_tour_id' => 'required|exists:virtual_tours,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'initial_yaw'     => 'nullable|numeric',
            'sphere_file'     => 'array',
            'sphere_file.*'   => 'string|max:255',
            'sphere_image'    => 'array',
            'sphere_image.*'  => 'string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $sphere = Sphere::withTrashed()->findOrFail($id);
            $sphere->fill($validated)->save();

            if ($request->has('sphere_file')) {
                $files = $request->input('sphere_file');
                if (is_array($files) && count($files) > 0) {
                    $last = end($files);
                    $request->merge(['sphere_file' => [$last]]);
                }
                $sphere->clearMediaCollection('sphere_file');
                MediaLibrary::put($sphere, 'sphere_file', $request, 'sphere_file');
            }

            if ($request->has('sphere_image')) {
                $imgs = $request->input('sphere_image');
                if (is_array($imgs) && count($imgs) > 0) {
                    $lastImg = end($imgs);
                    $request->merge(['sphere_image' => [$lastImg]]);
                }
                $sphere->clearMediaCollection('sphere_image');
                MediaLibrary::put($sphere, 'sphere_image', $request, 'sphere_image');
            }

            DB::commit();
            return redirect()->route('sphere.index')->with('success', 'Sphere berhasil diperbarui.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Update Sphere error: ' . $e->getMessage());
            return back()->withErrors('error', 'Gagal memperbarui sphere.');
        }
    }

    public function destroy($id)
    {
        Sphere::findOrFail($id)->delete();
        return redirect()->route('sphere.index')->with('success', 'Sphere dihapus.');
    }

    public function trashed()
    {
        $spheres = Sphere::onlyTrashed()->with('virtualTour')->get();
        return Inertia::render('Sphere/Trashed', compact('spheres'));
    }

    public function restore($id)
    {
        Sphere::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('sphere.index')->with('success', 'Sphere dipulihkan.');
    }

    public function forceDelete($id)
    {
        $sphere = Sphere::onlyTrashed()->where('id', $id)->firstOrFail();
        $sphere->clearMediaCollection('sphere_file');
        $sphere->clearMediaCollection('sphere_image');
        $sphere->forceDelete();

        return redirect()->route('sphere.index')->with('success', 'Sphere dihapus permanen.');
    }
}
