# Generated by Django 3.2.6 on 2021-08-29 01:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('register', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='registration',
            name='confirm_password',
            field=models.CharField(blank=True, default='randomM235', max_length=20),
        ),
        migrations.AddField(
            model_name='registration',
            name='first_name',
            field=models.CharField(default='john', max_length=200),
        ),
        migrations.AddField(
            model_name='registration',
            name='last_name',
            field=models.CharField(default='doe', max_length=200),
        ),
        migrations.AddField(
            model_name='registration',
            name='password',
            field=models.CharField(blank=True, default='randomM235', max_length=20),
        ),
    ]
