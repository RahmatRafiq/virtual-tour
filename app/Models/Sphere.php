<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Sphere extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'virtual_tour_id',
        'name',
        'description',
        'initial_yaw',
    ];

    public function virtualTour(): BelongsTo
    {
        return $this->belongsTo(VirtualTour::class);
    }

    public function hotspots(): HasMany
    {
        return $this->hasMany(Hotspot::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('sphere_image')->singleFile();
    }

    public function getPanoramaUrlAttribute(): ?string
    {
        return $this->getFirstMediaUrl('sphere_image') ?: null;
    }
}
