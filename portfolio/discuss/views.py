from django.shortcuts import render
from .forms import opportunityForm

# Create your views here.
def opportunity(request):
    if request.method == 'POST':
        filled_form = opportunityForm(request.POST)
        if filled_form.is_valid():
            filled_form.save()
            note = 'Hi {}, thank you for reaching out, I will get back to you on {}'.format(filled_form.cleaned_data['recruiterName'],
            filled_form.cleaned_data['recruiterEmail'],
            filled_form.cleaned_data['jobDetails'])
            new_form = opportunityForm()
            return render(request, 'opportunity/opportunity.html', {'opportunityForm': new_form})
    else:
        form = opportunityForm()
        return render(request, 'opportunity/opportunity.html', {'opportunityForm': form})