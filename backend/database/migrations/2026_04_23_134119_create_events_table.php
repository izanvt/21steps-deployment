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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->boolean('completed')->default(false);
            $table->boolean('cancelled')->default(false);
            $table->integer('metric_value')->nullable(); // valor introducido ese día
            $table->timestamps();
            $table->foreignId('user_routine_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_routine_activity_id')
                ->constrained()
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
