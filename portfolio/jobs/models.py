from django.db import models

# Create your models here.
class Job(models.Model):
    image = models.ImageField(upload_to='images/')
    roleName = models.CharField(max_length=100)
    roleKeySkills = models.CharField(max_length=100)
    roleLocation = models.CharField(max_length=100)
    roleDescription = models.CharField(max_length=1000)