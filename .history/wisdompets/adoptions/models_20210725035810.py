from django.db import models

# Create your models here.
class Pet(models.Model):
    """
    the sex_choices is a tuple, here first letter denotes value stored in the database
    second value is what is displayed on screen
    """
    SEX_CHOICES = [('M', 'Male'), ('F', 'Female')]
    name = models.CharField(max_length=100)
    submitter = models.CharField(max_length=100)
    species = models.CharField(max_length=20)
    breed = models.CharField(max_length=10, blank=True)
    description = models.TextField()

    """
    setting blank = true, allows a field to be set null
    """
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, blank=True)
    submission_date = models.DateTimeField()

    """
    using null here because using blank sets the integer value to 0 which
    doesn't makes it clear whether age was supplied or pet was less than 
    a monthg
    """
    age = models.IntegerField(null=True)
    vaccinations = models.ManyToMany('Vaccine', blank=True)


class Vaccine(models.Model):
    name = models.CharField(max_length=50)    