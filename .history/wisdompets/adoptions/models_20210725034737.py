from django.db import models

# Create your models here.
class Pet(models.Model):
    name = models.CharField(max_length=100)
    submitter = models.CharField(max_length=100)
    species = models.CharField(max_length=20)
    breed = models.CharField(max_length=10, blank=True)
    description = models.TextField()
    