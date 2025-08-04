from django import forms
from .models import opportunity

class opportunityForm(forms.ModelForm):
    class Meta:
        model = opportunity
        fields = ['recruiterName', 'recruiterEmail', 'jobDetails']
        labels = {'recruiterName':'Name','recruiterEmail': 'Email','jobDetails':'Job Description'}
        widgets = {'jobDetails':forms.Textarea}