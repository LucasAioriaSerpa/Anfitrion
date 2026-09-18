
from threading import Thread
import sys, os, time


if getattr(sys, 'frozen', False): BASE_DIR = sys._MEIPASS
else: BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Main:
    def __init__(self) -> None: pass
    def run(self):
        print("main")
        from database import Setup_db
        while True:
            print("working...")
            time.sleep(5)
                

if "__main__" == __name__:
    from api.App import App
    main = Thread(target=Main().run)
    flask = Thread(target=App().run)
    main.start()
    flask.start()
