from django.contrib import admin
from .models import Registration

# Register your models here.
@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('id','username','first_name','last_name','phone','email','address','city','state','zipcode','title','employed_at','achievements')
    list_display_link = ('id','name')
    list_filter = ('name','email',)
    search_fields = ('email','name','city','zipcode')
    list_per_page = 25
