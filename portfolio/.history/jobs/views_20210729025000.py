from django.shortcuts import render

# Create your views here.
def experience(request):
    jobs = Job.objects
    return render(request, 'experience/exp.html', { 'jobs' : jobs })