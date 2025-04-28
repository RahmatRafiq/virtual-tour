<?php
namespace App\Http\Controllers;

use App\Helpers\DataTable;
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
            'sphere_file.*'  => 'sometimes|required|file|mimes:jpeg,jpg,png,webp,obj,glb|max:5120',
            'sphere_image.*' => 'sometimes|required|file|mimes:jpeg,jpg,png,webp|max:2048',
            'sphere_id'      => 'nullable|exists:spheres,id',
        ]);

        $model = $request->sphere_id
        ? Sphere::find($request->sphere_id)
        : new Sphere();

        $response = [];

        // handle file (.obj, .glb, etc)
        if ($request->hasFile('sphere_file')) {
            $file                      = $request->file('sphere_file')[0];
            $path                      = Storage::disk('temp')->putFile('', $file);
            $response['sphere_file'][] = basename($path);
        }

        // handle image (360° panorama)
        if ($request->hasFile('sphere_image')) {
            $image                      = $request->file('sphere_image')[0];
            $path                       = Storage::disk('temp')->putFile('', $image);
            $response['sphere_image'][] = basename($path);
        }

        return response()->json($response, 200);
    }

    public function deleteFile(Request $request)
    {
        $data = $request->validate(['filename' => 'required|string']);

        // delete from temp
        if (Storage::disk('temp')->exists($data['filename'])) {
            Storage::disk('temp')->delete($data['filename']);
        }

        // delete from media library
        $media = \Spatie\MediaLibrary\MediaCollections\Models\Media::where('file_name', $data['filename'])->first();
        if ($media) {
            $media->delete();
        }

        return response()->json(['message' => 'File berhasil dihapus'], 200);
    }

    public function create()
    {
        return Inertia::render('Sphere/Form', [
            'virtualTours' => VirtualTour::all(),
            'sphere'       => null,
            'sphere_file'  => [],
            'sphere_image' => [],
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
            'sphere_image'    => 'array',
        ]);

        DB::beginTransaction();
        try {
            $sphere = Sphere::create($validated);

            // move from temp to media collection
            if (! empty($validated['sphere_file'])) {
                foreach ($validated['sphere_file'] as $filename) {
                    $tempPath = Storage::disk('temp')->path($filename);
                    if (file_exists($tempPath)) {
                        $sphere->addMedia($tempPath)
                            ->usingFileName($filename)
                            ->toMediaCollection('sphere_file');
                        Storage::disk('temp')->delete($filename);
                    }
                }
            }
            if (! empty($validated['sphere_image'])) {
                foreach ($validated['sphere_image'] as $filename) {
                    $tempPath = Storage::disk('temp')->path($filename);
                    if (file_exists($tempPath)) {
                        $sphere->addMedia($tempPath)
                            ->usingFileName($filename)
                            ->toMediaCollection('sphere_image');
                        Storage::disk('temp')->delete($filename);
                    }
                }
            }

            DB::commit();
            return redirect()->route('sphere.index')->with('success', 'Sphere berhasil dibuat.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Store Sphere error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal membuat sphere.']);
        }
    }

    public function edit($id)
    {
        $sphere      = Sphere::withTrashed()->findOrFail($id);
        $sphereFile  = $sphere->getFirstMedia('sphere_file');
        $sphereImage = $sphere->getFirstMedia('sphere_image');

        return Inertia::render('Sphere/Form', [
            'virtualTours' => VirtualTour::all(),
            'sphere'       => $sphere,
            'sphere_file'  => $sphereFile?->file_name ? [$sphereFile->file_name] : [],
            'sphere_image' => $sphereImage?->file_name ? [$sphereImage->file_name] : [],
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
            'sphere_image'    => 'array',
        ]);

        DB::beginTransaction();
        try {
            $sphere = Sphere::withTrashed()->findOrFail($id);
            $sphere->fill($validated)->save();

            // process sphere_file
            if (array_key_exists('sphere_file', $validated)) {
                // clear existing
                $sphere->clearMediaCollection('sphere_file');
                foreach ($validated['sphere_file'] as $filename) {
                    $tempPath = Storage::disk('temp')->path($filename);
                    if (file_exists($tempPath)) {
                        $sphere->addMedia($tempPath)
                            ->usingFileName($filename)
                            ->toMediaCollection('sphere_file');
                        Storage::disk('temp')->delete($filename);
                    }
                }
            }
            // process sphere_image
            if (array_key_exists('sphere_image', $validated)) {
                $sphere->clearMediaCollection('sphere_image');
                foreach ($validated['sphere_image'] as $filename) {
                    $tempPath = Storage::disk('temp')->path($filename);
                    if (file_exists($tempPath)) {
                        $sphere->addMedia($tempPath)
                            ->usingFileName($filename)
                            ->toMediaCollection('sphere_image');
                        Storage::disk('temp')->delete($filename);
                    }
                }
            }

            DB::commit();
            return redirect()->route('sphere.index')->with('success', 'Sphere berhasil diperbarui.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Update Sphere error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui sphere.']);
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
