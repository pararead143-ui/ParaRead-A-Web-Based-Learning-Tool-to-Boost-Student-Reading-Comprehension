from django.db import models
from django.conf import settings



class Passage(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()

    def __str__(self):
        return self.title

class ReadingMaterial(models.Model):
    user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="reading_materials_readings"
)

    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='uploads/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class SegmentedPart(models.Model):
    reading = models.ForeignKey(ReadingMaterial, on_delete=models.CASCADE, related_name="segments")
    segment_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Segment of {self.reading.title}"

class Summary(models.Model):
    reading = models.ForeignKey(
        'ReadingMaterial',
        on_delete=models.CASCADE,
        related_name='summaries'
    )
    summary_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Summary of {self.reading.title}"
