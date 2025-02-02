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
