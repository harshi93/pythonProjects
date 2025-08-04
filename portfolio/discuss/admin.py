from django.contrib import admin
from .models import opportunity

# Register your models here.
@admin.register(opportunity)
class opportunityAdmin(admin.ModelAdmin):
    list_display = ['recruiterName', 'recruiterEmail', 'jobDetails']
    list_filter = ('recruiterName',)
    list_filter = ('recruiterEmail',)
