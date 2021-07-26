from django.contrib import admin


from .models import Pet

# Register your models here.

"""
the admin register decorator takes in model
"""
@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    pass