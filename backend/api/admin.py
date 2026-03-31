from django.contrib import admin
from .models import Profile, Perfume, PreferenceProfile, Recommendation

admin.site.register(Profile)
admin.site.register(Perfume)
admin.site.register(PreferenceProfile)
admin.site.register(Recommendation)
