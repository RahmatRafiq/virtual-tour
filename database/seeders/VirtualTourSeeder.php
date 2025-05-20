<?php
namespace Database\Seeders;

use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VirtualTourSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        $categoryNames = ['Museum', 'Gallery', 'Historical Site', 'Park', 'Exhibition'];
        $categoryIds = [];
        foreach ($categoryNames as $name) {
            $categoryIds[] = DB::table('categories')->insertGetId([
                'name'       => $name,
                'type'       => 'virtual tour',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $virtualTourIds = [];
        for ($i = 0; $i < 25; $i++) {
            $virtualTourIds[] = DB::table('virtual_tours')->insertGetId([
                'category_id' => $faker->randomElement($categoryIds),
                'name'        => $faker->city . ' ' . $faker->word . ' Tour',
                'description' => $faker->realText(120),
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        $sphereIds = [];
        for ($i = 0; $i < 50; $i++) {
            $sphereIds[] = DB::table('spheres')->insertGetId([
                'virtual_tour_id' => $faker->randomElement($virtualTourIds),
                'name'            => ucfirst($faker->word) . ' Room',
                'description'     => $faker->sentence(8),
                'initial_yaw'     => $faker->randomFloat(2, -3.14, 3.14),
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }

        foreach ($sphereIds as $sphereId) {
            $hotspotCount = rand(1, 5);
            for ($j = 0; $j < $hotspotCount; $j++) {
                DB::table('hotspots')->insert([
                    'sphere_id'        => $sphereId,
                    'type'             => $faker->randomElement(['info', 'navigation']),
                    'target_sphere_id' => $faker->randomElement($sphereIds),
                    'yaw'              => $faker->randomFloat(2, -3.14, 3.14),
                    'pitch'            => $faker->randomFloat(2, -1.57, 1.57),
                    'tooltip'          => ucfirst($faker->words(2, true)),
                    'content'          => $faker->realText(80),
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }
        }
    }
}
