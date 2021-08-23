from django.shortcuts import render, redirect
from django.contrib import messages


# Create your views here.

def signup(request):
    if request.method == 'POST':
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        username = request.POST['username']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']

        print(firstname, lastname, username, password)

        if password == confirm_password:
            return 'submitted registration'
        else:
            messages.error(request, 'password do not match')
    return render(request, 'accounts/register.html')


def login(request):
    return render(request, 'accounts/login.html')


def logout(request):
    return redirect(request, 'accounts/logout.html')


def dashboard(request):
    return render(request, 'accounts/dashboard.html')
