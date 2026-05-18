<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Routine extends Model
{
    protected $fillable = [
        'name',
        'description',
        'icon',
        'quotes',
        'metric_type',
    ];

    protected $casts = ['quotes' => 'array'];


    public function resources()
    {
        return $this->hasMany(Resource::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function userRoutines()
    {
        return $this->hasMany(userRoutine::class);
    }
}
