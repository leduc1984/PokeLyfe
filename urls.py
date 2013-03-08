from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
                       url(r'^home$', 'pokeapp.views.home'),
                       url(r'^time$', 'pokeapp.views.timenow'),
                       url(r'^movement$','pokeapp.views.movement'),
                       url(r'^keydown$', 'pokeapp.views.keydown'),
                       url(r'^myposition$', 'pokeapp.views.myposition'),
                       url(r'^other_chars$', 'pokeapp.views.other_chars'),
                       (r'site_media/(?P<path>.*)$', 'django.views.static.serve',
                        {'document_root': '/home/matthew/Capstone/Pokemon/templates/'}),
    # Examples:
    # url(r'^$', 'Pokemon.views.home', name='home'),
    # url(r'^Pokemon/', include('Pokemon.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
