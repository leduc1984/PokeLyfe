from django.db import models
from django.contrib.auth.models import User

from datetime import datetime
# Create your models here.

class Character(models.Model):
    user = models.OneToOneField(User)
    x = models.IntegerField()
    y = models.IntegerField()
    last_online = models.FloatField()
    
    def send_message(self, text, recipients):
        m = self.sent_messages.create(timestamp = datetime.now(),
                                      text = text)
        if recipients == "all":
            r = Character.objects.exclude(id=self.id)
        else:
            r = [Character.objects.get(id=int(e)) for e in recipients.split()]
        m.recipients.add(*r)

        
    
class Message(models.Model):
    timestamp = models.DateTimeField()
    text = models.CharField(max_length = 500)
    sender = models.ForeignKey(Character,
                               related_name = "sent_messages")
    recipients = models.ManyToManyField(Character,
                                        related_name = "received_messages")


        
