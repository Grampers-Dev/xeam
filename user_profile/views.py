from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib import messages
from django.views.generic import DetailView
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.forms import PasswordResetForm
from .forms import ExtendedUserCreationForm, ProfileForm
from user_profile.models import Profile, Post, StakedToken
import json
from datetime import datetime


def index(request):
    return render(request, 'users/index.html')


class PostDetail(DetailView):
    model = Post
    template_name = 'index.html'
    context_object_name = 'post'
    queryset = Post.objects.filter(status=1)
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['post'] = Post.objects.filter(status=1)
        return context

    def get_queryset(self):
        return Post.objects.filter(status=1)

    def get(self, request, *args, **kwargs):
        return render(request, 'index.html')

    def post(self, request, *args, **kwargs):
        return render(request, 'index.html')


def register(request):
    if request.method == 'POST':
        form = ExtendedUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            subject = 'Welcome to Tangle!'
            context = {'username': user.username}
            html_message = render_to_string('users/welcome_email.html', context)
            plain_message = strip_tags(html_message)
            send_mail(subject, plain_message, 'tangleforum.info@gmail.com', [user.email], html_message=html_message)
            messages.success(request, 'Your account has been created. Please log in.')
            return redirect('login')
    else:
        form = ExtendedUserCreationForm()
    return render(request, 'users/register.html', {'form': form})


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

    return render(request, 'users/profile.html', {'form': form, 'object': profile})


def custom_login(request):
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
                messages.error(request, 'Invalid username or password. Please try again.')
    else:
        form = ExtendedUserCreationForm()
    return render(request, 'user_profile/login.html', {'form': form})


def custom_logout(request):
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('login')


def custom_password_reset(request):
    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('password_reset_done')
    else:
        form = PasswordResetForm()
    return render(request, 'account/password_reset_form.html', {'form': form})


@login_required
def profile_view(request):
    user = request.user
    profile, _ = Profile.objects.get_or_create(user=user)

    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = ProfileForm(instance=profile)

    stake = StakedToken.objects.filter(user=user).first()
    reward_estimate = 0
    tier = None
    staked_seconds = 0

    if stake:
        total_weight = sum([s.get_weight() for s in StakedToken.objects.all()])
        reward_estimate = stake.calculate_reward_share(total_weight, 100000)
        tier = stake.get_tier_multiplier()
        staked_seconds = stake.time_staked_seconds()

    context = {
        'form': form,
        'object': profile,
        'stake': stake,
        'reward_estimate': reward_estimate,
        'tier': tier,
        'staked_seconds': staked_seconds,
    }
    return render(request, 'users/profile.html', context)


@csrf_exempt
def log_stake(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = request.user
        amount = float(data.get('amount'))
        wallet = data.get('wallet')

        stake, created = StakedToken.objects.update_or_create(
            user=user,
            defaults={'amount_staked': amount, 'wallet_address': wallet}
        )
        return JsonResponse({'status': 'success'})
    return JsonResponse({'error': 'invalid method'}, status=400)

def whitepaper(request):
    return render(request, 'users/whitepaper.html')

def presale_view(request):
    return render(request, 'users/presale.html')
