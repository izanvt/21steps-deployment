<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    protected $fillable = [
        'name',
        'path',
        'routine_id',
        'activity_id',
    ];

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function routine()
    {
        return $this->belongsTo(Routine::class);
    }
}