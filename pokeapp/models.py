from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Character(models.Model):
    user = models.OneToOneField(User)
    x = models.IntegerField()
    y = models.IntegerField()
    last_online = models.FloatField()
