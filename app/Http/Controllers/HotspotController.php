<?php
namespace App\Http\Controllers;

use App\Helpers\DataTable;
use App\Models\Hotspot;
use App\Models\Sphere;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HotspotController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->query('filter', 'active');

        $hotspots = match ($filter) {
            'trashed' => Hotspot::onlyTrashed()->with(['sphere', 'targetSphere'])->get(),
            'all' => Hotspot::withTrashed()->with(['sphere', 'targetSphere'])->get(),
            default => Hotspot::with(['sphere', 'targetSphere'])->get(),
        };

        return Inertia::render('Hotspot/Index', [
            'hotspots' => $hotspots,
            'filter'   => $filter,
        ]);
    }

    public function json(Request $request)
    {
        $search = $request->input('search.value', '');
        $filter = $request->input('filter', 'active');

        $query = match ($filter) {
            'trashed' => Hotspot::onlyTrashed()->with(['sphere', 'targetSphere']),
            'all' => Hotspot::withTrashed()->with(['sphere', 'targetSphere']),
            default => Hotspot::with(['sphere', 'targetSphere']),
        };

        if ($search) {
            $query->where(fn($q) =>
                $q->where('type', 'like', "%{$search}%")
                    ->orWhere('tooltip', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
            );
        }

        $columns = ['id', 'type', 'tooltip', 'yaw', 'pitch', 'created_at'];
        if ($request->filled('order')) {
            $col = $columns[$request->order[0]['column']] ?? 'id';
            $query->orderBy($col, $request->order[0]['dir']);
        }

        $data = DataTable::paginate($query, $request);

        $data['data'] = collect($data['data'])->map(fn($hotspot) => [
            'id'           => $hotspot->id,
            'type'         => $hotspot->type,
            'tooltip'      => $hotspot->tooltip,
            'yaw'          => $hotspot->yaw,
            'pitch'        => $hotspot->pitch,
            'sphere'       => $hotspot->sphere?->name,
            'targetSphere' => $hotspot->targetSphere?->name,
            'trashed'      => $hotspot->trashed(),
            'actions'      => '',
        ]);

        return response()->json($data);
    }

    public function create()
    {
        $spheres = Sphere::with('media')->get(); // Pastikan media sphere dimuat

        return Inertia::render('Hotspot/Form', [
            'hotspot' => null,
            'spheres' => $spheres->map(function ($sphere) {
                return [
                    'id'    => $sphere->id,
                    'name'  => $sphere->name,
                    'media' => $sphere->getFirstMediaUrl('sphere_file'), // URL media sphere
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sphere_id'        => 'required|exists:spheres,id',
            'type'             => 'required|string|max:50',
            'target_sphere_id' => 'nullable|exists:spheres,id',
            'yaw'              => 'nullable|numeric',
            'pitch'            => 'nullable|numeric',
            'tooltip'          => 'nullable|string|max:255',
            'content'          => 'nullable|string',
        ]);

        try {
            Hotspot::create($validated);
            return redirect()->route('hotspot.index')->with('success', 'Hotspot berhasil dibuat.');
        } catch (\Throwable $e) {
            \Log::error('Store Hotspot error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal membuat hotspot.']);
        }
    }

    public function edit($id)
    {
        $hotspot = Hotspot::withTrashed()->findOrFail($id);
        $spheres = Sphere::with('media')->get();
        return Inertia::render('Hotspot/Form', [
            'hotspot' => $hotspot,
            'spheres' => $spheres->map(function ($sphere) {
                return [
                    'id'          => $sphere->id,
                    'name'        => $sphere->name,
                    'sphere_file'  => $sphere->getFirstMediaUrl('sphere_file'), // URL media sphere_file
                    'sphere_image' => $sphere->getFirstMediaUrl('sphere_image'), // URL media sphere_image
                ];
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'sphere_id'        => 'required|exists:spheres,id',
            'type'             => 'required|string|max:50',
            'target_sphere_id' => 'nullable|exists:spheres,id',
            'yaw'              => 'nullable|numeric',
            'pitch'            => 'nullable|numeric',
            'tooltip'          => 'nullable|string|max:255',
            'content'          => 'nullable|string',
        ]);

        try {
            $hotspot = Hotspot::withTrashed()->findOrFail($id);
            $hotspot->update($validated);

            return redirect()->route('hotspot.index')->with('success', 'Hotspot berhasil diperbarui.');
        } catch (\Throwable $e) {
            \Log::error('Update Hotspot error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Gagal memperbarui hotspot.']);
        }
    }

    public function destroy($id)
    {
        Hotspot::findOrFail($id)->delete();
        return redirect()->route('hotspot.index')->with('success', 'Hotspot dihapus.');
    }

    public function trashed()
    {
        $hotspots = Hotspot::onlyTrashed()->with(['sphere', 'targetSphere'])->get();
        return Inertia::render('Hotspot/Trashed', compact('hotspots'));
    }

    public function restore($id)
    {
        Hotspot::onlyTrashed()->where('id', $id)->restore();
        return redirect()->route('hotspot.index')->with('success', 'Hotspot dipulihkan.');
    }

    public function forceDelete($id)
    {
        $hotspot = Hotspot::onlyTrashed()->findOrFail($id);
        $hotspot->forceDelete();

        return redirect()->route('hotspot.index')->with('success', 'Hotspot dihapus permanen.');
    }
}
