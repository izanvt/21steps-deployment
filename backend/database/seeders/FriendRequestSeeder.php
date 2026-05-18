<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\FriendRequest;

class FriendRequestSeeder extends Seeder
{
    public function run(): void
    {
        $izan = User::where('email', 'izan@test.com')->value('id');
        $uri  = User::where('email', 'uri@test.com')->value('id');

        FriendRequest::insert([
            [
                'sender_id'   => $uri,
                'receiver_id' => $izan,
                'status'      => 0, // pendiente
                'created_at'  => now()->subDay(),
                'updated_at'  => now()->subDay(),
            ],
        ]);
    }
}