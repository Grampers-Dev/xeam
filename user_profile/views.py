from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .forms import ExtendedUserCreationForm
from django.contrib import messages
#from forum.models import Profile
#from cloudinary.forms import cl_init_js_callbacks      
#from .forms import ProfileForm
from user_profile.models import Profile 
from django.contrib.auth.forms import PasswordResetForm


def register(request):
    """
    View for user registration.

    Handles the registration form submission and creates a new user account.
    Sends a welcome email to the newly registered user.

    Parameters:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponseRedirect: Redirects to the login page upon successful registration.
    """
    if request.method == 'POST':
        form = ExtendedUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()

            #Send welcome email to the newly registered user
            subject = 'Welcome to Tangle!'
            context = {'username': user.username}  # Pass any additional context variables needed for the email template
            html_message = render_to_string('user_profile/welcome_email.html', context)
            plain_message = strip_tags(html_message)
            send_mail(subject, plain_message, 'tangleforum.info@gmail.com', [user.email], html_message=html_message)

            messages.success(request, 'Your account has been created. Please log in.')
            return redirect('login')
    else:
        form = ExtendedUserCreationForm()
    return render(request, 'user_profile/register.html', {'form': form})


@login_required
def profile(request):
    profile, created = Profile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = ProfileForm(instance=profile)

    return render(request, 'user_profile/profile.html', {'form': form, 'object': profile})


def custom_login(request):
    """
    Custom login view.

    Handles user authentication and login.

    Parameters:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponseRedirect: Redirects to the home page upon successful login.

    References:
        Django authentication:
        https://docs.djangoproject.com
        /en/stable/topics/auth/default/#how-to-log-a-user-in
        Django forms: https://docs.djangoproject.com/en/stable/topics/forms/
        Django messages:
        https://docs.djangoproject.com/en/stable/ref/contrib/messages/
    """

    if request.method == 'POST':
        form = ExtendedUserCreationForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('index')
            else:
                messages.error(request,
                               'Invalid username or password Please try again')
    else:
        form = ExtendedUserCreationForm()
    return render(request, 'user_profile/login.html', {'form': form})


def custom_logout(request):
    """
    Custom logout view.

    Handles user logout.

    Parameters:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponseRedirect: Redirects to the login page upon logout.

    Reference:
        Django authentication:
        https://docs.djangoproject.com
        /en/stable/topics/auth/default/#how-to-log-a-user-out
    """
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('login')

#def password_reset_view(request):
#    """
#    View for password reset.
#
#    Handles the password reset form submission and sends an email to the user with a password reset link.
#
#    Parameters:
#        request (HttpRequest): The HTTP request object.
#
#    Returns:
#        HttpResponseRedirect: Redirects to the password reset done page upon successful password reset request.
#    """
#    if request.method == 'POST':
#        form = PasswordResetForm(request.POST)
#        if form.is_valid():
#            form.save()
#            return redirect('login')
#    else:
#        form = PasswordResetForm()
#    return render(request, 'user_profile/login.html')

def custom_password_reset(request):
    """
    Custom password reset view.

    Handles the password reset form submission and sends an email to the user with a password reset link.

    Parameters:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponseRedirect: Redirects to the password reset done page upon successful password reset request.

    References:
        Django authentication:
        https://docs.djangoproject.com/en/stable/topics/auth/default/#using-the-views
    """
    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('password_reset_done')
    else:
        form = PasswordResetForm()
    return render(request, 'account/password_reset_form.html', {'form': form})