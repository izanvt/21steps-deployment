<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserRoutineActivity extends Model
{
    protected $fillable = [
        'user_routine_id',
        'activity_id',
        'day_of_week',
    ];

    public function userRoutine()
    {
        return $this->belongsTo(UserRoutine::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }
}