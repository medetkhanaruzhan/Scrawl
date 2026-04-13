from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        """Auto-create an auth token whenever a new User is saved."""
        from django.contrib.auth.models import User
        from django.db.models.signals import post_save
        from rest_framework.authtoken.models import Token

        def create_token(sender, instance, created, **kwargs):
            if created:
                Token.objects.create(user=instance)

        post_save.connect(create_token, sender=User)
