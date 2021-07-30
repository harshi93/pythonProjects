from django.db import models

# Create your models here.
class Job(models.Model):
    image = models.ImageField(upload_to='images/')
    Name = models.CharField(max_length=100)
    KeySkills = models.CharField(max_length=100)
    Location = models.CharField(max_length=100)
    Description = models.CharField(max_length=1000)