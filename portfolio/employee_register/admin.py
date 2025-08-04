from django.contrib import admin

from .models import Position, Employee

# Register your models here.

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['position']

@admin.register(Employee)
class Employee(admin.ModelAdmin):
    list_display = ['fullname','emp_code','mobile','position']
