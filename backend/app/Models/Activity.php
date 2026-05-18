<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'name',
        'description',
        'duration',
        'routine_id',
    ];

    public function routine()
    {
        return $this->belongsTo(Routine::class);
    }

    public function userRoutineActivities()
    {
        return $this->hasMany(UserRoutineActivity::class);
    }

    public function resource()
    {
        return $this->hasOne(Resource::class);
    }
}
