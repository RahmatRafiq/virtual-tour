<?php
namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Helpers\MediaLibrary;
use App\Models\Sphere;
use App\Models\VirtualTour;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Storage;

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
            'virtualTour' => $sphere->virtualTour->name,
            'trashed'     => $sphere->trashed(),
            'actions'     => '',
        ]);

        return response()->json($data);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'sphere_file'  => 'required|file|max:5120',
            'sphere_image' => 'required|image|max:2048|mimes:jpeg,jpg,png,webp',
            'sphere_id'    => 'nullable|exists:spheres,id',
        ]);

        $model = $request->sphere_id
        ? Sphere::find($request->sphere_id)
        : new Sphere();

        $spherePath = $request->file('sphere_file')->store('', 'temp');
        $imagePath  = $request->file('sphere_image')->store('', 'temp');

        MediaLibrary::put(
            $model,
            'sphere',
            $request,
            'sphere_file'
        );
        MediaLibrary::put(
            $model,
            'sphere_image',
            $request,
            'sphere_image'
        );

        Storage::disk('temp')->delete([$spherePath, $imagePath]);

        return response()->json([
            'sphere_url'       => $model->getFirstMediaUrl('sphere'),
            'sphere_image_url' => $model->getFirstMediaUrl('sphere_image'),
        ]);
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
        ]);

        DB::beginTransaction();
        try {
            $sphere = Sphere::create($validated);

            if ($request->hasFile('sphere_file')) {
                MediaLibrary::put(
                    $sphere,
                    'sphere',
                    $request,
                    'sphere_file'
                );
            }
            if ($request->hasFile('sphere_image')) {
                MediaLibrary::put(
                    $sphere,
                    'sphere_image',
                    $request,
                    'sphere_image'
                );
            }

            DB::commit();
            return redirect()->route('spheres.index')->with('success', 'Sphere berhasil dibuat.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Store Sphere error: ' . $e->getMessage());
            return back()->withErrors('error', 'Gagal membuat sphere.');
        }
    }

    public function edit($id)
    {
        $sphere      = Sphere::withTrashed()->findOrFail($id);
        $sphereFile  = $sphere->getFirstMedia('sphere');
        $sphereImage = $sphere->getFirstMedia('sphere_image');

        return Inertia::render('Sphere/Form', [
            'virtualTours' => VirtualTour::all(),
            'sphere'       => $sphere,
            'sphere_file'  => $sphereFile?->getFullUrl(),
            'sphere_image' => $sphereImage?->getFullUrl(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'virtual_tour_id' => 'required|exists:virtual_tours,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'initial_yaw'     => 'nullable|numeric',
            'sphere_file'     => 'nullable|file|max:5120',
            'sphere_image'    => 'nullable|image|max:2048|mimes:jpeg,jpg,png,webp',
        ]);

        DB::beginTransaction();
        try {
            $sphere = Sphere::withTrashed()->findOrFail($id);
            $sphere->fill($validated)->save();

            if ($request->hasFile('sphere_file')) {
                $sphere->clearMediaCollection('sphere');
                MediaLibrary::put($sphere, 'sphere', $request, 'sphere_file');
            }
            if ($request->hasFile('sphere_image')) {
                $sphere->clearMediaCollection('sphere_image');
                MediaLibrary::put($sphere, 'sphere_image', $request, 'sphere_image');
            }

            DB::commit();
            return redirect()->route('spheres.index')->with('success', 'Sphere berhasil diperbarui.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Update Sphere error: ' . $e->getMessage());
            return back()->withErrors('error', 'Gagal memperbarui sphere.');
        }
    }

    public function destroy($id)
    {
        Sphere::findOrFail($id)->delete();
        return redirect()->route('spheres.index')->with('success', 'Sphere dihapus.');
    }

    public function trashed()
    {
        $spheres = Sphere::onlyTrashed()->with('virtualTour')->get();
        return Inertia::render('Sphere/Trashed', compact('spheres'));
    }

    public function restore($id)
    {
        Sphere::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('spheres.index')->with('success', 'Sphere dipulihkan.');
    }

    public function forceDelete($id)
    {
        $sphere = Sphere::onlyTrashed()->where('id', $id)->firstOrFail();
        $sphere->clearMediaCollection('sphere');
        $sphere->clearMediaCollection('sphere_image');
        $sphere->forceDelete();

        return redirect()->route('spheres.index')->with('success', 'Sphere dihapus permanen.');
    }
}
