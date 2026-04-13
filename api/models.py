from django.db import models
from django.contrib.auth.models import User


# ─── Custom Manager (Bonus) ────────────────────────────────────────────────────

class ScrawlManager(models.Manager):
    """Custom manager with convenience query methods."""

    def get_recent(self):
        """Return all scrawls ordered by newest first."""
        return self.order_by('-created_at')

    def filter_by_tag(self, tag_name):
        """Return scrawls that have a tag with the given name."""
        return self.filter(tags__name__iexact=tag_name)


# ─── Models ────────────────────────────────────────────────────────────────────

class Tag(models.Model):
    """A topic label that can be attached to many Scrawls."""
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Scrawl(models.Model):
    """The main post object — the core of the platform."""

    MOOD_CHOICES = [
        ('happy',    '😊 Happy'),
        ('sad',      '😢 Sad'),
        ('angry',    '😠 Angry'),
        ('excited',  '🎉 Excited'),
        ('neutral',  '😐 Neutral'),
    ]

    author       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scrawls')
    content      = models.TextField()
    mood         = models.CharField(max_length=20, choices=MOOD_CHOICES, blank=True, null=True)
    image        = models.ImageField(upload_to='scrawls/', blank=True, null=True)
    is_anonymous = models.BooleanField(default=False)
    tags         = models.ManyToManyField(Tag, blank=True, related_name='scrawls')
    created_at   = models.DateTimeField(auto_now_add=True)

    # Attach the custom manager
    objects = ScrawlManager()

    def __str__(self):
        return f"Scrawl by {self.author.username} at {self.created_at:%Y-%m-%d %H:%M}"


class Reply(models.Model):
    """A reply to a Scrawl or to another Reply (nested threads)."""
    author       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='replies')
    scrawl       = models.ForeignKey(Scrawl, on_delete=models.CASCADE, related_name='replies')
    parent_reply = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='children'
    )
    content    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply by {self.author.username} on Scrawl #{self.scrawl_id}"


class Like(models.Model):
    """A user liking a Scrawl."""
    user   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    scrawl = models.ForeignKey(Scrawl, on_delete=models.CASCADE, related_name='likes')

    class Meta:
        unique_together = ('user', 'scrawl')  # one like per user per scrawl

    def __str__(self):
        return f"{self.user.username} likes Scrawl #{self.scrawl_id}"


class Save(models.Model):
    """A user saving a Scrawl for later."""
    user   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saves')
    scrawl = models.ForeignKey(Scrawl, on_delete=models.CASCADE, related_name='saves')

    class Meta:
        unique_together = ('user', 'scrawl')  # one save per user per scrawl

    def __str__(self):
        return f"{self.user.username} saved Scrawl #{self.scrawl_id}"
