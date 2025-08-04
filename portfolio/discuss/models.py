from django.db import models

# Create your models here.
class opportunity(models.Model):
    recruiterName = models.CharField(max_length=100)
    recruiterEmail = models.CharField(max_length=100)
    jobDetails = models.CharField(max_length=1000) 