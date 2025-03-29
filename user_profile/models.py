from django.db import models
from django.contrib.auth import get_user_model
from cloudinary.models import CloudinaryField

User = get_user_model()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_profile')
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    image = CloudinaryField('image', default='https://res.cloudinary.com/dhx65uemx/image/upload/v1716398543/anftfroi95huytw9tnv5.png')

    def __str__(self):
        return self.user.username


class Photo(models.Model):
    image = CloudinaryField('image')
    description = models.TextField(blank=True)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)

    def __str__(self):
        return f"Photo {self.id} - {self.description[:20]}"
    
STATUS = ((0, "Draft"), (1, "Published"))

# Create your models here.


class Post(models.Model):
    title = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posts"
    )
    content = models.TextField(
        max_length=2000,
        help_text="Write your blog content here"
    )
    created_on = models.DateTimeField(auto_now_add=True)
    status = models.IntegerField(choices=STATUS, default=0)
    excerpt = models.TextField(blank=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_on"]

    def __str__(self):
        return f"{self.title} | written by {self.author}"

class Comment(models.Model):
    post = models.ForeignKey(
        Post, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="commenter")
    body = models.TextField()
    approved = models.BooleanField(default=False)
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_on"]

    def __str__(self):
        return f"Comment {self.body} by {self.author}"

# models.py
from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, timedelta

class StakedToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    wallet_address = models.CharField(max_length=42)
    amount_staked = models.DecimalField(max_digits=20, decimal_places=8)
    stake_date = models.DateTimeField(auto_now_add=True)
    last_reward_sent = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.amount_staked} XEAM"

    def time_staked_seconds(self):
        return (datetime.now() - self.stake_date).total_seconds()

    def get_tier_multiplier(self):
        amount = float(self.amount_staked)
        if amount >= 5000:
            return 2.0  # Diamond
        elif amount >= 1000:
            return 1.5  # Gold
        elif amount >= 500:
            return 1.2  # Silver
        elif amount >= 100:
            return 1.0  # Bronze
        else:
            return 0.5  # Base

    def get_weight(self):
        return float(self.amount_staked) * self.time_staked_seconds() * self.get_tier_multiplier()

    def calculate_reward_share(self, total_weight, reward_pool):
        if total_weight == 0:
            return 0
        share = self.get_weight() / total_weight
        return round(share * reward_pool, 4)


# management/commands/calculate_rewards.py
from django.core.management.base import BaseCommand
from user_profile.models import StakedToken

class Command(BaseCommand):
    help = 'Calculate staking rewards based on weighted stake duration and amount.'

    def handle(self, *args, **kwargs):
        reward_pool = 100000  # total XEAM to distribute
        all_stakes = StakedToken.objects.all()

        total_weight = sum([stake.get_weight() for stake in all_stakes])

        self.stdout.write(f"Total reward pool: {reward_pool} XEAM")
        self.stdout.write(f"Total weighted stake: {total_weight}")

        for stake in all_stakes:
            reward = stake.calculate_reward_share(total_weight, reward_pool)
            self.stdout.write(
                f"User: {stake.user.username} | Tier: {stake.get_tier_multiplier()}x | Reward: {reward} XEAM"
            )
