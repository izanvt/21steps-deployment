<?php

namespace Database\Seeders;


use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // asegurarnos de que sean 1 y 2
        $adminRole = Role::where('name', 'admin')->first();
        $userRole  = Role::where('name', 'user')->first();

        User::insert([
            [
                'role_id' => $adminRole->id,
                'name' => 'Izan',
                'email' => 'izan@test.com',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'share_token' => Str::random(8),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => $userRole->id,
                'name' => 'Uri',
                'email' => 'uri@test.com',
                'password' => Hash::make('12345678'),
                'email_verified_at' => now(),
                'share_token' => Str::random(8),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
