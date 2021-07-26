from django.contrib import admin


from ./models.py import Pet

# Register your models here.
@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
    pass