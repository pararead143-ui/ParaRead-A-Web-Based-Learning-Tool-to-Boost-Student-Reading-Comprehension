from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse

def get_all_readings(request):
    return JsonResponse({"message": "Readings API works!"})
