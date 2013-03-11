from django.conf.urls.defaults import patterns, include, url


urlpatterns = patterns('pokeapp.views',
                       url(r'^home$', 'home'),
                       url(r'^time$', 'timenow'),
                       url(r'^movement$','movement'),
                       url(r'^keydown$', 'keydown'),
                       url(r'^myposition$', 'myposition'),
                       url(r'^other_chars$', 'other_chars'),
    # Examples:
    # url(r'^$', 'Pokemon.views.home', name='home'),
    # url(r'^Pokemon/', include('Pokemon.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)

