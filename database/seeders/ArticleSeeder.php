<?php
namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        $categories = [];
        $categoryNames = ['Teknologi', 'Pemrograman', 'Tips & Trik', 'Berita', 'Tutorial'];
        foreach ($categoryNames as $name) {
            $categories[] = Category::firstOrCreate(
                ['name' => $name, 'type' => 'article']
            );
        }

        $tagList = ['laravel', 'php', 'tutorial', 'web', 'backend', 'frontend', 'tips', 'coding', 'dev', 'artikel'];

        for ($i = 1; $i <= 25; $i++) {
            $category = $faker->randomElement($categories);

            $title = $faker->sentence(rand(3, 6));
            $slug  = Str::slug($title);

            Article::create([
                'category_id' => $category->id,
                'title'       => $title,
                'slug'        => $slug,
                'content'     => $faker->paragraphs(rand(3, 7), true),
                'tags'        => $faker->randomElements($tagList, rand(2, 4)),
            ]);
        }
    }
}
