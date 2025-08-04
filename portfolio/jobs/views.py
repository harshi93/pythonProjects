from django.shortcuts import render, get_object_or_404
from .models import Job

# Create your views here.
def experience(request):
    jobs = Job.objects
    return render(request, 'experience/exp.html', {'jobs':jobs})

def details(request, job_id):
    """
    first argument is class, second stands for primary key
    """
    job_detail = get_object_or_404(Job, pk=job_id)
    return render(request, 'experience/detail.html', { 'job': job_detail })