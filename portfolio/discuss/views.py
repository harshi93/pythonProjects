from django.shortcuts import render
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from .forms import opportunityForm
from .models import opportunity

# Create your views here.
def oppos(request):
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


def conversation(request):
    convos = opportunity.objects.all()
    
    paginator = Paginator(convos, 5) 
    page_number = request.GET.get('page')
    paged_convos = paginator.get_page(page_number)

    print(paginator)

    return render(request, 'opportunity/conversation.html', {'convos': paged_convos})