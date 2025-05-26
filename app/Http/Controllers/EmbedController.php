<?php
namespace App\Http\Controllers;

use App\Models\VirtualTour;
use Inertia\Inertia;

class EmbedController extends Controller
{

    public function show(VirtualTour $tour)
    {
        // Load relations lengkap sama seperti di showVirtualTour
        $tour->load([
            'category',             // kategori tour
            'spheres.media',        // media tiap sphere
            'spheres.hotspots.targetSphere',
            'spheres.hotspots.sphere',
        ]);

        // Kirim data tour sebagai array ke Vue/React
        return Inertia::render('Embed/Tour', [
            'tour' => $tour->toArray(),
        ]);
    }
}
