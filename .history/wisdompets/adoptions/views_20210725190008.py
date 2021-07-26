from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def home(request):
    return HttpResponse('<p>This is home page</p>')

def pet_detail(request, pet_id):
    return HttpResponse(f'<p>pet detail view with id {pet_id}</p>')    