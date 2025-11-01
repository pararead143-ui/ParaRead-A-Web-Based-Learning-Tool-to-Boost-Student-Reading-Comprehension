
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import ReadingMaterial, SegmentedPart, Summary  # ✅ include Summary
from .serializers import ReadingMaterialSerializer, SegmentedPartSerializer
from . import utils
from transformers import pipeline

# ✅ Load a lightweight summarization model once
try:
    summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
    print("✅ Summarization model loaded successfully.")
except Exception as e:
    summarizer = None
    print(f"⚠️ Failed to load summarizer: {e}")


class ReadingMaterialViewSet(viewsets.ModelViewSet):
    queryset = ReadingMaterial.objects.all()
    serializer_class = ReadingMaterialSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return ReadingMaterial.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        if instance.file:
            try:
                raw_text = utils.extract_text_from_uploaded_file(instance.file)
                instance.content = raw_text.strip() if raw_text else ""
                instance.save()
            except Exception as e:
                print(f"❌ File extraction error: {e}")
                instance.content = ""
                instance.save()

    # ----------------------------
    # Segment + Simplify
    # ----------------------------
    @action(detail=True, methods=["post"])
    def segment(self, request, pk=None):
        reading = self.get_object()
        text = reading.content or ""

        if not text.strip() and reading.file:
            print("⚙️ Retrying extraction from file...")
            text = utils.extract_text_from_uploaded_file(reading.file)
            reading.content = text.strip() if text else ""
            reading.save()

        if not text.strip():
            return Response(
                {"detail": "No readable text found in file or content."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            simplified_segments = utils.segment_and_simplify(text, similarity_threshold=0.55)
            if not simplified_segments:
                simplified_segments = [text.strip()]
        except Exception as e:
            print(f"❌ Segmentation error: {e}")
            return Response(
                {"detail": f"Segmentation failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        SegmentedPart.objects.filter(reading=reading).delete()
        created_segments = []
        for seg_text in simplified_segments:
            sp = SegmentedPart.objects.create(
                reading=reading,
                segment_text=seg_text
            )
            created_segments.append(SegmentedPartSerializer(sp).data)

        return Response({
            "id": reading.id,
            "title": reading.title,
            "segments": created_segments
        }, status=status.HTTP_200_OK)

    # ----------------------------
    # Summarization Endpoint
    # ----------------------------
    @action(detail=True, methods=["post"])
    def summarize(self, request, pk=None):
        reading = self.get_object()

        # ✅ Use segmented text if available, otherwise the raw content
        segments = SegmentedPart.objects.filter(reading=reading)
        text_to_summarize = " ".join(seg.segment_text for seg in segments) if segments.exists() else (reading.content or "")

        if not text_to_summarize.strip():
            return Response(
                {"detail": "No text available to summarize."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not summarizer:
            return Response(
                {"detail": "Summarization model not available."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            # ✅ Break large text into chunks if too long for model
            max_chunk_len = 1000
            chunks = [text_to_summarize[i:i + max_chunk_len] for i in range(0, len(text_to_summarize), max_chunk_len)]

            summaries = []
            for chunk in chunks:
                output = summarizer(chunk, max_length=150, min_length=30, do_sample=False)
                summaries.append(output[0]["summary_text"])

            summary_text = " ".join(summaries)
            print("✅ Summarization completed successfully.")

            # ✅ Save to database (SQLite)
            Summary.objects.create(
                reading=reading,
                summary_text=summary_text
            )

        except Exception as e:
            print(f"❌ Summarization error: {e}")
            return Response(
                {"detail": f"Summarization failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            "id": reading.id,
            "title": reading.title,
            "summary": summary_text
        }, status=status.HTTP_200_OK)
