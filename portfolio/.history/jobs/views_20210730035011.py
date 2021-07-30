from django.shortcuts import render
from .models import Job

# Create your views here.
def experience(request):
    jobs = Job.objects
    return render(request, 'experience/exp.html', {'jobs':jobs})

def details(request, job_id):
    pass    