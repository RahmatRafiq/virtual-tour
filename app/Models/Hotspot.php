<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Hotspot extends Model
{
    use HasFactory;

    protected $fillable = [
        'sphere_id',
        'type',
        'target_sphere_id',
        'yaw',
        'pitch',
        'tooltip',
        'content',
    ];

    public function sphere(): BelongsTo
    {
        return $this->belongsTo(Sphere::class);
    }

    public function targetSphere(): BelongsTo
    {
        return $this->belongsTo(Sphere::class, 'target_sphere_id');
    }
}
