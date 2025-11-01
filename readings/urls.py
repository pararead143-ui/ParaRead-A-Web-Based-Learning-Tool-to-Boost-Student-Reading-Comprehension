from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReadingMaterialViewSet

router = DefaultRouter()
router.register(r'', ReadingMaterialViewSet, basename='readings')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:pk>/summarize/', ReadingMaterialViewSet.as_view({'post': 'summarize'}), name='reading-summarize'),
    
]
