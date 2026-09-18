
import os, sys

_OS_PATH = os.path

if getattr(sys, 'frozen', False): ROOT_DIR = sys._MEIPASS
else: ROOT_DIR = _OS_PATH.dirname(_OS_PATH.dirname(_OS_PATH.dirname(_OS_PATH.abspath(__file__))))

DATABASE_DIR = _OS_PATH.join(ROOT_DIR, "database/db_anfitrion.db")
