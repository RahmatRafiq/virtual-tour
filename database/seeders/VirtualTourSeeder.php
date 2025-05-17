<?php
namespace Database\Seeders;

use App\Models\Category;
use App\Models\VirtualTour;
use Illuminate\Database\Seeder;

class VirtualTourSeeder extends Seeder
{
    public function run(): void
    {
        $categoryIds = Category::pluck('id')->toArray();

        \Faker\Factory::create();

        for ($i = 0; $i < 20; $i++) {
            VirtualTour::create([
                'name'        => fake()->sentence(3),
                'description' => fake()->paragraph,
                'category_id' => fake()->randomElement($categoryIds),
            ]);
        }
    }
}
