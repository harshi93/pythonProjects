from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login, logout
from .forms import RegistrationForm

# Create your views here.

def signup(request):
    form = RegistrationForm()
    context = {
        'form': form
    }
    
    if request.method == 'POST':
        filled_form = RegistrationForm(request.POST)
        if filled_form.is_valid():
            filled_form.save()
            user = filled_form.cleaned_data.get('username')
            messages.success(request, 'Registration Successful' + user)
            return redirect('login')
    
    return render(request, 'accounts/register.html', context)

def loginPage(request):

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        print(request.POST.get('username'))

        user = authenticate(request, username=username, password=password)

        if user is not None:
            messages.success(request, 'Login Successful')
            login(request, user)
            return redirect('discuss')
        else:
            print("Nothing logged in")
    return render(request, 'accounts/login.html')


def logout(request):
    return redirect(request, 'accounts/logout.html')


def dashboard(request):
    return render(request, 'accounts/dashboard.html')
