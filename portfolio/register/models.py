from django.db import models

# Create your models here.
class Registration(models.Model):
    name = models.CharField(max_length=200)
    photo = models.ImageField(upload_to='photos/%Y/%m/%d')
    phone = models.CharField(max_length=20)
    email = models.CharField(max_length=50)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=20)
    state = models.CharField(max_length=20)
    zipcode = models.CharField(max_length=200)
    title = models.CharField(max_length=50)
    employed_at = models.CharField(max_length=50)
    achievements = models.TextField(blank=True)