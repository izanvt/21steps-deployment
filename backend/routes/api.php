<?php

use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FriendRequestController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoutineController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GoogleCalendarController;
use Illuminate\Support\Facades\Route;

//rutas públicas auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// email
Route::get('/email/verify/{id}/{hash}', function ($id, $hash) {
    $user = \App\Models\User::findOrFail($id);

    if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Enlace no válido'], 403);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'El email ya estaba verificado']);
    }

    if ($user->markEmailAsVerified()) {
        event(new \Illuminate\Auth\Events\Verified($user));
    }

    return response()->json([
        'message' => 'Email verificado correctamente'
    ]);
})->middleware(['signed'])->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return response()->json([
        'message' => 'Email de verificación enviado'
    ]);
})->middleware(['auth:sanctum', 'throttle:6,1']);

// endpoint público para el share_token
Route::get('/u/{share_token}', [ProfileController::class, 'publicProfile']);

// callback de google, si falla redirige a la app
Route::get('/google/callback', [GoogleCalendarController::class, 'handleCallback']);

// rutas protegidas
Route::middleware(['auth:sanctum'])->group(function () {

    // auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // rutinas predefinidas (plantillas)
    Route::get('/baseroutines', [RoutineController::class, 'index']);

    // rutinas del usuario
    Route::get('/routines', [RoutineController::class, 'userRoutines']);
    Route::get('/routines/{userRoutine}', [RoutineController::class, 'userRoutineById']);
    Route::post('/routines', [RoutineController::class, 'store']);
    Route::patch('/routines/{userRoutine}', [RoutineController::class, 'update']);
    Route::delete('/routines/{userRoutine}', [RoutineController::class, 'destroy']);
    Route::post('/routines/{userRoutine}/pause', [RoutineController::class, 'pause']);
    Route::post('/routines/{userRoutine}/unpause', [RoutineController::class, 'unpause']);

    // eventos
    Route::post('/events/{event}/complete', [RoutineController::class, 'completeEvent']);
    Route::post('/events/{event}/uncomplete', [RoutineController::class, 'uncompleteEvent']);

    // perfil
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);

    //badges (función abreviada que devuelve todas las badges en json, evita crear un Controller solo para esto)
    Route::get('/badges', fn() => \App\Models\Badge::all());

    // amistad
    Route::get('/friends', [FriendRequestController::class, 'index']);
    Route::get('/friend-requests/pending', [FriendRequestController::class, 'pending']);
    Route::post('/friend-requests', [FriendRequestController::class, 'send']);
    Route::patch('/friend-requests/{friendRequest}/accept', [FriendRequestController::class, 'accept']);
    Route::patch('/friend-requests/{friendRequest}/reject', [FriendRequestController::class, 'reject']);
    Route::delete('/friends/{friendRequest}', [FriendRequestController::class, 'destroy']);

    // calendar API
    Route::get('/google/status', [GoogleCalendarController::class, 'status']);
    Route::get('/google/auth', [GoogleCalendarController::class, 'redirectToGoogle']);
    Route::post('/google/sync/{userRoutine}', [GoogleCalendarController::class, 'syncRoutine']);
    Route::delete('/google/disconnect', [GoogleCalendarController::class, 'disconnect']);

});

// rutas administración con su propio middleware
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::patch('/users/{user}/block', [UserController::class, 'block']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
});
