from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import IsAdmin, IsAdminOrReadOnly

from .models import Society, Block, Flat
from .serializers import BlockCreateSerializer, BlockSerializer, FlatCreateSerializer, FlatSerializer, SocietySerializer


class SocietyListCreateView(generics.ListCreateAPIView):
    queryset = Society.objects.all()
    serializer_class = SocietySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Society.objects.all()
        name = self.request.query_params.get("name")
        city = self.request.query_params.get("city")
        if name:
            queryset = queryset.filter(name__icontains=name)
        if city:
            queryset = queryset.filter(city__icontains=city)
        return queryset


class SocietyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Society.objects.all()
    serializer_class = SocietySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]


class BlockListCreateView(generics.ListCreateAPIView):
    queryset = Block.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return BlockCreateSerializer
        return BlockSerializer

    def get_queryset(self):
        queryset = Block.objects.all()
        society_id = self.request.query_params.get("society_id")
        if society_id:
            queryset = queryset.filter(society_id=society_id)
        return queryset


class BlockDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]


class FlatListCreateView(generics.ListCreateAPIView):
    queryset = Flat.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return FlatCreateSerializer
        return FlatSerializer

    def get_queryset(self):
        queryset = Flat.objects.all()
        block_id = self.request.query_params.get("block_id")
        society_id = self.request.query_params.get("society_id")
        if block_id:
            queryset = queryset.filter(block_id=block_id)
        if society_id:
            queryset = queryset.filter(block__society_id=society_id)
        return queryset


class FlatDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Flat.objects.all()
    serializer_class = FlatSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
