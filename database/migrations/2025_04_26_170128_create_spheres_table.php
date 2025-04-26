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
        Schema::create('spheres', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('virtual_tour_id')->constrained('virtual_tours')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->float('initial_yaw')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spheres');
    }
};
