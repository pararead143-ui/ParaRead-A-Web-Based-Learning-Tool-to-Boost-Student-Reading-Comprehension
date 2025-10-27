from django.urls import path
from . import views

urlpatterns = [
    # Example route – update these later if you already have reading views
    path('', views.get_all_readings, name='get_all_readings'),
]
