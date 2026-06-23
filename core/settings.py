from pathlib import Path
from decouple import config, Csv
try:
    import dj_database_url
    HAS_DJ_DATABASE_URL = True
except ImportError:
    HAS_DJ_DATABASE_URL = False

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY')

DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='127.0.0.1,localhost,.railway.app,mahmoudkaram326.pythonanywhere.com', cast=Csv())

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',

    # Local apps
    'users',
    'files',
    'offers',
    'payments',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

DATABASE_URL = config('DATABASE_URL', default=None)
if DATABASE_URL and HAS_DJ_DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=600, conn_health_checks=True),
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = 'users.User'

LANGUAGE_CODE = 'ar'

TIME_ZONE = 'Asia/Riyadh'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SUPABASE_URL = config('SUPABASE_URL', default='')
SUPABASE_KEY = config('SUPABASE_KEY', default='')
SUPABASE_BUCKET = config('SUPABASE_BUCKET', default='academic-files')

GEMINI_API_KEY = config('GEMINI_API_KEY', default='')

PLATFORM_FEE_PERCENT = 15

PRICING = {
    "SA": {
        "quran": {"solo": 20, "group": 14, "currency": "SAR"},
        "university": {"solo": 30, "group": 20, "currency": "SAR"},
        "high_school": {"solo": 25, "group": 17, "currency": "SAR"},
        "middle_school": {"solo": 20, "group": 14, "currency": "SAR"},
        "primary": {"solo": 15, "group": 10, "currency": "SAR"},
        "kindergarten": {"solo": 12, "group": 8, "currency": "SAR"},
        "languages": {"solo": 25, "group": 17, "currency": "SAR"},
    },
    "KW": {
        "quran": {"solo": 1.7, "group": 1.2, "currency": "KWD"},
        "university": {"solo": 2.5, "group": 1.7, "currency": "KWD"},
        "high_school": {"solo": 2.0, "group": 1.4, "currency": "KWD"},
        "middle_school": {"solo": 1.7, "group": 1.2, "currency": "KWD"},
        "primary": {"solo": 1.2, "group": 0.8, "currency": "KWD"},
        "kindergarten": {"solo": 1.0, "group": 0.7, "currency": "KWD"},
        "languages": {"solo": 2.0, "group": 1.4, "currency": "KWD"},
    },
    "AE": {
        "quran": {"solo": 20, "group": 14, "currency": "AED"},
        "university": {"solo": 30, "group": 20, "currency": "AED"},
        "high_school": {"solo": 25, "group": 17, "currency": "AED"},
        "middle_school": {"solo": 20, "group": 14, "currency": "AED"},
        "primary": {"solo": 15, "group": 10, "currency": "AED"},
        "kindergarten": {"solo": 12, "group": 8, "currency": "AED"},
        "languages": {"solo": 25, "group": 17, "currency": "AED"},
    },
    "QA": {
        "quran": {"solo": 20, "group": 14, "currency": "QAR"},
        "university": {"solo": 30, "group": 20, "currency": "QAR"},
        "high_school": {"solo": 25, "group": 17, "currency": "QAR"},
        "middle_school": {"solo": 20, "group": 14, "currency": "QAR"},
        "primary": {"solo": 15, "group": 10, "currency": "QAR"},
        "kindergarten": {"solo": 12, "group": 8, "currency": "QAR"},
        "languages": {"solo": 25, "group": 17, "currency": "QAR"},
    },
}

MAX_GROUP_SIZE = 10
PLATFORM_FEE = 0.15

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

PAYPAL_CLIENT_ID = config('PAYPAL_CLIENT_ID', default='')
PAYPAL_CLIENT_SECRET = config('PAYPAL_CLIENT_SECRET', default='')
PAYPAL_MODE = config('PAYPAL_MODE', default='sandbox')
PAYPAL_WEBHOOK_ID = config('PAYPAL_WEBHOOK_ID', default='')

LOGGING = {
    'version': 1,
    'handlers': {'console': {'class': 'logging.StreamHandler'}},
    'loggers': {'payments': {'handlers': ['console'], 'level': 'INFO'}},
}
