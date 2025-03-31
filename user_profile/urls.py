from django.urls import path
from django.contrib.auth import views as auth_views
from . import views, views
from .forms import ExtendedAuthenticationForm
#from allauth.account.views import (
#    PasswordResetView, 
#    PasswordResetDoneView, 
#    PasswordResetFromKeyView, 
#    PasswordResetFromKeyDoneView
#)

urlpatterns = [
    path('index/', views.index, name='index'),
    path('register/', views.register, name='register'),
    path('profile/', views.profile_view, name='profile'),

    path('log-stake/', views.log_stake, name='log_stake'),
    path('whitepaper/', views.whitepaper, name='whitepaper'),


    path('login/', auth_views.LoginView.as_view(template_name=
    'users/login.html', authentication_form=ExtendedAuthenticationForm), 
    name='login'), 
    path('logout/', views.custom_logout, name='logout'),
    path('password/reset/', auth_views.PasswordResetView.as_view(template_name='account/password_reset_form.html'), name='reset_password'),
    path('password/change/done/', auth_views.PasswordChangeDoneView.as_view(template_name='account/password_change_done.html'), name='account_change_password_done'),
#    path('password/reset/', PasswordResetView.as_view(template_name='account/password_reset_request_form.html'), name='account_reset_password'),
#    path('password/reset/done/', PasswordResetDoneView.as_view(template_name='account/password_reset_done.html'), name='account_reset_password_done'),
#    path('password/reset/key/<uidb36>/<key>/', PasswordResetFromKeyView.as_view(template_name='account/password_reset_from_key.html'), name='account_reset_password_from_key'),
#    path('password/reset/key/done/', PasswordResetFromKeyDoneView.as_view(template_name='account/password_reset_from_key_done.html'), name='account_reset_password_from_key_done'), 
] 