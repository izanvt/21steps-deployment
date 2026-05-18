<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'date',
        'completed',
        'cancelled',
        'metric_value',
        'user_routine_id',
        'user_routine_activity_id',
        'mood',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date'         => 'date',
            'completed'    => 'boolean',
            'cancelled'    => 'boolean',
            'metric_value' => 'decimal:2',
        ];
    }

    public function userRoutine()
    {
        return $this->belongsTo(UserRoutine::class);
    }

    public function userRoutineActivity()
    {
        return $this->belongsTo(UserRoutineActivity::class);
    }
}
