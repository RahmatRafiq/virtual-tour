<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hotspots', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('sphere_id')
                ->constrained('spheres')
                ->cascadeOnDelete();
            $table->enum('type', ['navigation', 'info'])->default('info');
            $table->foreignId('target_sphere_id')
                ->nullable()
                ->constrained('spheres')
                ->nullOnDelete();
            $table->float('yaw');
            $table->float('pitch');
            $table->string('tooltip')->nullable();
            $table->text('content')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotspots');
    }
};
