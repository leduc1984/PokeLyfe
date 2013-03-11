from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
                       url(r'^([A-z0-9_]+)$', include('pokeapp.urls')),
                       (r'site_media/(?P<path>.*)$', 'django.views.static.serve',
                        {'document_root': '/app/templates/'}),
    # Examples:
    # url(r'^$', 'Pokemon.views.home', name='home'),
    # url(r'^Pokemon/', include('Pokemon.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
