from django.urls import path
from .views import upload_resume,chat,ats_score, build_resume

urlpatterns = [
    path("upload/",upload_resume),
    path('ats-score/', ats_score, name='ats_score'),
    path('build-resume/', build_resume, name='build_resume'),
    path("chat/",chat),
]
