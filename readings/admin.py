from django.contrib import admin
from .models import ReadingMaterial, SegmentedPart, Summary

@admin.register(ReadingMaterial)
class ReadingMaterialAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "created_at")
    search_fields = ("title", "content")

@admin.register(SegmentedPart)
class SegmentedPartAdmin(admin.ModelAdmin):
    list_display = ("id", "reading")
    search_fields = ("segment_text",)

@admin.register(Summary)
class SummaryAdmin(admin.ModelAdmin):
    list_display = ("id", "reading", "created_at")