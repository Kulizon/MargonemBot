import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementNotInteractableException
from selenium.common.exceptions import TimeoutException

import pyautogui
import time

# cmd
# cd C:\Program Files\Google\Chrome\Application   
# chrome.exe --remote-debugging-port=8989 --user-data-dir=C:\Users\Kacper\Desktop\ChromeDataMargo


opt=Options()
opt.add_experimental_option("debuggerAddress", "localhost:8989")
opt.add_argument("--dns-prefetch-disable")

driver = webdriver.Chrome(executable_path=(r"C:\Users\Kacper\Desktop\ChromeDataMargo\chromedriver.exe"), options=opt)
wait = WebDriverWait(driver, 20)

def wait_random_time(min, max):
        wait_val =  random.randint(min, max)
        time.sleep(wait_val / 1000)

def hold_key(key, hold_time):
    start = time.time()
    while time.time() - start < hold_time / 1000:
        pyautogui.keyDown(key)
    pyautogui.keyUp(key)

# import bot
# import solveCaptcha
from bot import move_player, close_alert, auto_fight, attack_mob
from solveCaptcha import *

def run_bot():
    try:
        while (1):
            running = driver.execute_script("return window.localStorage.getItem('isRunning')")
            
            print(123)

            if (running == "false"):
                time.sleep(1)
                continue

            try:
                isDead = driver.execute_script("return g.dead")
                if isDead:
                    print(1)
                    time.sleep(10)
                    continue
            except ElementNotInteractableException:
                print('G is not interactable')

            
            # if dead then wait
            # g.dead

            close_alert(driver)

            move_player(driver)
            attack_mob(driver)
            auto_fight(driver)
            
            close_alert(driver)
            solve_captcha(driver)

            
    except TimeoutException:
        print("Timeout!")
        driver.navigate().refresh()
        time.sleep(5)
        run_bot()


time.sleep(1)
run_bot()

# import sys

# # 1. Import QApplication and all the required widgets
# from PyQt6.QtWidgets import QApplication, QPushButton, QWidget

# # 2. Create an instance of QApplication
# app = QApplication([])

# window = QWidget()
# window.setWindowTitle("PyQt App")
# window.setGeometry(100, 100, 280, 80)

# runButton = QPushButton("Run Bot", parent=window)
# runButton.clicked.connect(run_bot)
# # run bot in app 
# # driver.runscript

# # on close set running = false and then emmm refresh page
# runButton.move(60, 15)

# # 4. Show your application's GUI
# window.show()

# # 5. Run your application's event loop
# sys.exit(app.exec())










