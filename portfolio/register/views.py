from django.shortcuts import render, redirect

# Create your views here.
def signup(request):
    return render(request, 'accounts/register.html')

def login(request):
    return render(request, 'accounts/login.html')

def logout(request):
    return redirect(request, 'accounts/logout.html')

def dashboard(request):
    return render(request, 'accounts/dashboard.html')