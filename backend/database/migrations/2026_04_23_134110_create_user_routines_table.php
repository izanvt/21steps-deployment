<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // los datos que hacen cada rutina distinta por pertenecer a un usuario

        Schema::create('user_routines', function (Blueprint $table) {
            $table->id();
            $table->string('colour');
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('paused')->default(false);
            $table->date('paused_until')->nullable();
            $table->integer('target_value')->nullable();

            $table->timestamps();   
            
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('routine_id')->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_routines');
    }
};
