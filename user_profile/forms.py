from django import forms
from django.forms import ModelForm 
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
#from forum.models import Profile
from user_profile.models import Profile, Comment

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ('body',)

class ExtendedUserCreationForm(UserCreationForm):
    """
    Custom user creation form.

    Extends the built-in UserCreationForm to include email field.

    References:
        Django forms: https://docs.djangoproject.com/en/stable/topics/forms/
    """

    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def __init__(self, *args, **kwargs):
        """
        Initialize the form.

        Parameters:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        References:
            Django forms:
            https://docs.djangoproject.com/en/stable/topics/forms/
        """
        # Remove the 'request' parameter from kwargs
        kwargs.pop('request', None)

        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter a Username',
            'tabindex': '1'
        })
        self.fields['email'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter an Email',
            'tabindex': '2'
        })
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter a Password',
            'tabindex': '3'
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Confirm Password',
            'tabindex': '4'
        })

    def save(self, commit=True):
        """
        Save the user.

        Parameters:
            commit (bool): Whether to commit the changes (default is True).

        Returns:
            User: The created user object.

        References:
            Django models:
            https://docs.djangoproject.com/en/stable/topics/db/models/
        """
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user


class ExtendedAuthenticationForm(AuthenticationForm):
    """
    Custom authentication form.

    Extends built-in AuthenticationForm to include additional style attributes.

    References:
        Django forms: https://docs.djangoproject.com/en/stable/topics/forms/
    """

    def __init__(self, *args, **kwargs):
        """
        Initialize the form.

        Parameters:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        References:
            Django forms:
            https://docs.djangoproject.com/en/stable/topics/forms/
        """
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter a Username',
            'tabindex': '1'
        })
        self.fields['password'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Enter a Password',
            'tabindex': '2'
        })


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['bio', 'location', 'birth_date', 'image']



class PasswordChangeForm(forms.Form):
    """
    Form for changing the user's password.

    References:
        Django forms: https://docs.djangoproject.com/en/stable/topics/forms/
    """

    old_password = forms.CharField(
        label='Old Password',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter Old Password',
            'tabindex': '1'
        })
    )
    new_password1 = forms.CharField(
        label='New Password',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter New Password',
            'tabindex': '2'
        })
    )
    new_password2 = forms.CharField(
        label='Confirm New Password',
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm New Password',
            'tabindex': '3'
        })
    )

    def __init__(self, *args, **kwargs):
        """
        Initialize the form.

        Parameters:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.

        References:
            Django forms:
            https://docs.djangoproject.com/en/stable/topics/forms/
        """
        super().__init__(*args, **kwargs)

    def clean(self):
        """
        Clean the form.

        Returns:
            dict: The cleaned form data.

        References:
            Django forms:
            https://docs.djangoproject.com/en/stable/topics/forms/
        """
        cleaned_data = super().clean()
        new_password1 = cleaned_data.get('new_password1')
        new_password2 = cleaned_data.get('new_password2')

        if new_password1 and new_password2 and new_password1 != new_password2:
            raise forms.ValidationError('Passwords do not match.')

        return cleaned_data