"""
URL configuration for pdf_doc project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from pdf_tools.views import (
    pdf_to_text,
    pdf_to_word,
    pdf_to_image,
    pdf_to_split,
    pdf_to_merge,
    pdf_to_ppt,
    pdf_to_excel,
    convert,
)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Old endpoints — kept temporarily
    path("convert/text/", pdf_to_text),
    path("convert/word/", pdf_to_word),
    path("convert/image/", pdf_to_image),
    path("convert/split/", pdf_to_split),
    path("convert/merge/", pdf_to_merge),
    path("convert/ppt/", pdf_to_ppt),
    path("convert/excel/", pdf_to_excel),

    # New universal conversion endpoint
    path("convert/", convert),
]