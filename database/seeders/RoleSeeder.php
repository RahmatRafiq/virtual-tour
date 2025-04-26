<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Faker\Factory as Faker;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        for ($i = 0; $i < 20; $i++) {
            Role::firstOrCreate([
                'name' => $faker->unique()->jobTitle(), // Misal: "Project Manager", "Software Tester"
            ]);
        }
    }
}
