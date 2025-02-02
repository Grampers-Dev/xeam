from django.contrib import admin

from .models import Post, Comment

# Register your models here.
admin.site.register(Post)
admin.site.register(Comment)

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'created_on')
    search_fields = ('title', 'author')

class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'created_on')
    search_fields = ('post', 'author')
    

