<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Event;

class UserRoutine extends Model
{
    protected $fillable = [
        'colour',
        'start_date',
        'end_date',
        'paused',
        'paused_until',
        'user_id',
        'routine_id',
        'target_value',
    ];

    protected function casts(): array
    {
        return [
            'start_date'   => 'date',
            'end_date'     => 'date',
            'paused'       => 'boolean',
            'paused_until' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function routine()
    {
        return $this->belongsTo(Routine::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function userRoutineActivities()
    {
        return $this->hasMany(UserRoutineActivity::class);
    }
}
