import os

class Config:
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_NAME = os.environ.get('DB_NAME', 'cinops')
    DB_USER = os.environ.get('DB_USER', 'postgres')
    DB_PASS = os.environ.get('DB_PASS', '1234')
    DB_PORT = os.environ.get('DB_PORT', '5432') 
    
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_key')