from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("posts", "0006_comment"),
    ]

    operations = [
        migrations.AddField(
            model_name="post",
            name="tags",
            field=models.JSONField(blank=True, default=list),
        ),
    ]

