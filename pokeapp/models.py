from django.db import models

# Create your models here.

class Character(models.Model):
    x = models.IntegerField()
    y = models.IntegerField()
    last_online = models.FloatField()
