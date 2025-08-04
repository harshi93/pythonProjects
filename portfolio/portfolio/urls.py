"""portfolio URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
import jobs.views
import register.views
import employee_register.views
from discuss import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', jobs.views.experience, name='experience'),
    path('jobs/<int:job_id>', jobs.views.details, name='details'),
    path('discuss', views.oppos, name='discuss'),
    path('conversation', views.conversation, name='conversation'),
    path('login', register.views.loginPage, name='login'),
    path('signup', register.views.signup, name='signup'),
    path('logout', register.views.logout, name='logout'),
    path('dashboard', register.views.dashboard, name='dashboard'),
    path('lue', employee_register.views.employee_add, name='empshowup'),
    path('list', employee_register.views.employee_get, name='empget'),
    path('<int:id>', employee_register.views.employee_add, name='empshowup'),
    path('demp/<int:id>', employee_register.views.employee_delete, name='empdel')
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
