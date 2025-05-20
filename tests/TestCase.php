<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Jalankan seeder RoleSeeder sebelum setiap test
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
    }
}
