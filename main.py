import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import ElementNotInteractableException
from selenium.common.exceptions import JavascriptException
from selenium.common.exceptions import TimeoutException
from selenium.common.exceptions import NoSuchElementException

import pyautogui
import time
from pathfinding.core.grid import Grid
from pathfinding.finder.a_star import AStarFinder 

# cmd
# cd C:\Program Files\Google\Chrome\Application   
# chrome.exe --remote-debugging-port=8989 --user-data-dir=C:\Users\Kacper\Desktop\ChromeDataMargo


opt=Options()
opt.add_experimental_option("debuggerAddress", "localhost:8989")

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

def move_player():
    gMap = driver.execute_script("return JSON.parse(window.localStorage.getItem('gMap'))")
    moveCords = driver.execute_script("return JSON.parse(window.localStorage.getItem('moveCords'))")

    if gMap is None or moveCords is None:
        print("Error: gMap or moveCords are NoneType")
        return
    if not(any(gMap)) or not(any(moveCords)):
        return

    for i in range(len(gMap)):
        for j in range(len(gMap[i])):
            if (gMap[i][j] == 0 or gMap[i][j] == -2):
                gMap[i][j] = 1
            elif (gMap[i][j] == 1 or gMap[i][j] == 2):
                gMap[i][j] = 0

    grid = Grid(matrix=gMap)

    if moveCords.get("end").get("x") == None or moveCords.get("end").get("y") == None or moveCords.get("start").get("x") == None or moveCords.get("start").get("y") == None:
        return

    start = grid.node(moveCords.get("start").get("x"), moveCords.get("start").get("y"))
    end = grid.node(moveCords.get("end").get("x"), moveCords.get("end").get("y"))

    finder = AStarFinder()
    path, runs = finder.find_path(start, end, grid)

    moves = [[0, 0]] * (len(path) - 1)

    for i in range(0, len(path) - 1):
        moves[i] = [path[i + 1][0] -  path[i][0], path[i + 1][1] -  path[i][1]]

    if (len(moves) == 0 or (len(moves) == 1 and moves[0][0] == 0 and moves[0][1] == 0)):
        try:
            driver.execute_script("_g('walk')")
        except ElementNotInteractableException:
            print('G is not interactable')

    last_move = None

    # print(driver.execute_script("return hero.isMoving"))
    # print(moveCords.get("end").get("x"))

    # command = "hero.searchPath(" + str(moveCords.get("end").get("x")) +  ", " + str(moveCords.get("end").get("y")) + ")"
    # driver.execute_script(command)
    # time.sleep(0.25)

    # while (driver.execute_script("return hero.isMoving") == '0'):
    #     print(command)
    #     # driver.execute_script(command)
    #     time.sleep(0.5)

    i = -1
    for move in moves:
        i += 1
        running = driver.execute_script("return window.localStorage.getItem('isRunning')")

        if i % 3 == 0:
            npcs = driver.execute_script("return JSON.parse(window.localStorage.getItem('g')).npcs")
            isHere = False

            for npc in npcs:
                if moveCords.get("end").get("x")  == npc.get("x") and moveCords.get("end").get("y")  == npc.get("y"):
                    isHere = True
                    break

        double_tap = False
        hold_time = random.randint(20, 25)

        if last_move != None:
            if (last_move[0] != move[0] and last_move[1] != last_move[1]):
                hold_time = random.randint(60, 70)
                # double_tap = False
        last_move = move
            
        isChangingMap = driver.execute_script("return window.localStorage.getItem('isChangingMap')")
        if (isChangingMap == "true"):
            isHere = True

        if (running == "false" or isHere == False):
            break


        x_before = driver.execute_script("return hero.x")
        y_before = driver.execute_script("return hero.y")

        key = None

        if (move[0] == 1):
            key = 'd'
        elif (move[0] == -1):
            key = 'a'
        elif (move[1] == -1):
            key = 'w'
        elif (move[1] == 1):
            key = 's'

        
        if double_tap:
            hold_key(key, hold_time // 2)
            wait_random_time(20, 25)
            hold_key(key, hold_time)
        else:
            hold_key(key, hold_time)

        wait_random_time(20, 25)

        if x_before != None and y_before != None:
            if x_before + move[0] != driver.execute_script("return hero.x") or y_before + move[1] != driver.execute_script("return hero.y"):
                print("Not matching")
                break

    isChangingMap = driver.execute_script("return window.localStorage.getItem('isChangingMap')")

    if moveCords.get("end").get("x")  == moveCords.get("start").get("y") and moveCords.get("end").get("y")  == moveCords.get("start").get("y") and isChangingMap == "true":
        time.sleep(0.5)
        driver.execute_script("window.localStorage.setItem('isChangingMap', 'false');")

    
    if (isChangingMap == "false"):
         driver.execute_script("window.localStorage.setItem('moveCords',  JSON.stringify({start: {}, end: {}}))")
    driver.execute_script("window.localStorage.setItem('gMap',  JSON.stringify([]))")
    driver.execute_script("window.localStorage.setItem('isMoving', 'false');")

def close_alert():
    try:
        button = driver.find_element(By.ID, "a_ok")
        captchaTimer = driver.find_element(By.ID, "timer")

        if (not(captchaTimer)):
            button.click()
    except (NoSuchElementException, ElementNotInteractableException, StaleElementReferenceException):
        return
# 

def auto_fight():
    try:
        battle = driver.execute_script("return g.battle")
    except (StaleElementReferenceException, JavascriptException): 
        return

    if battle == False:
        return
    elif battle.get('endBattle') == False:
            hold_key("f", 20)

def attack_mob():
        attackMob = driver.execute_script("return JSON.parse(window.localStorage.getItem('attackMob'))")
        running = driver.execute_script("return window.localStorage.getItem('isRunning')")

        if (attackMob != True or running == "false"):
            return
        
        hold_key("e", 20)
 
        driver.execute_script("window.localStorage.setItem('attackMob', 'false');")


####################################################

import urllib
import urllib.request
import time
from selenium.webdriver.common.by import By
import cv2
import numpy as np
 
def detectLinesOnImage(img, i):
    # img = cv2.imread(imgPath)
    if img.shape[1] > 5 and img.shape[0] > 5:
        img = img[3:img.shape[0]-3, 3:img.shape[1]-3]

    # Detect only certain colors
    # lower = np.array([80, 80, 80], dtype = "uint8")
    # upper = np.array([220, 220, 220], dtype = "uint8")
    # mask = cv2.inRange(img, lower, upper)
    # img = cv2.bitwise_and(img, img, mask = mask)

    # Convert the img to grayscale
    img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply edge detection method on the image
    edges = cv2.Canny(img, 10, 200, apertureSize=3)
    minLength = 70
    threshold = 50

    lines = []
    # This returns an array of r and theta values
    lines = cv2.HoughLinesP(image=edges, rho=1, theta=np.pi/170, threshold=threshold, minLineLength=minLength, maxLineGap=10)

    # debugging
    if lines is not None:
        for line in lines:
            for x1, y1, x2, y2 in line:
                cv2.line(img , (x1, y1), (x2, y2), (0, 0, 255), 2)

    # debugging
    cv2.imwrite('linesDetected' + str(i) + '.jpg', img)

    if lines is not None:
        return True
    else:
        return False


def solve_captcha():
    # Get the image source
    try:
        img = driver.find_element(By.CSS_SELECTOR, ".captcha__image img")    
    except (NoSuchElementException, StaleElementReferenceException):
        return

    src = img.get_attribute('src')

    if (not(src)):
        return

    # Download the image
    urllib.request.urlretrieve(src, "captcha.png")
    time.sleep(0.5)

    img = cv2.imread('captcha.png')

    M = img.shape[0]//2
    N = img.shape[1]//3
    tiles = [img[x:x+M,y:y+N] for x in range(0,img.shape[0],M) for y in range(0,img.shape[1],N)]

    results = []

    for i in range(0, len(tiles)):
        res = detectLinesOnImage(tiles[i], i)
        results.append(res)

    # find text here "nie"

    detectImagesWithLines = True
    try:
        captchaQuestion = driver.find_element(By.CLASS_NAME, "captcha__question")
        if " nie " in captchaQuestion.get_attribute('innerText') or "pozbawione" in captchaQuestion.get_attribute('innerText'):
            detectImagesWithLines = False
    except NoSuchElementException:
        print("No such element")

    print("pozbawione" in captchaQuestion.get_attribute('innerText'))


    for i in range(7):
        # bug cropping images
        index = i + 1

        if i == 3:
            continue
        if i > 3:
            index = i

        try:
            if ((results[i] and detectImagesWithLines) or (not(results[i]) and not(detectImagesWithLines))):
                # click A
                button = driver.find_element(By.CSS_SELECTOR, "#captcha > div > div.captcha__content > div.captcha__buttons > div:nth-child("+ str(index) +")")
                button.click()
        except (NoSuchElementException, StaleElementReferenceException):
            continue

    # wait_random_time(1000, 2500)

    # closeButton = driver.find_element(By.XPATH, '//*[@id="captcha"]/div/div[3]/div[4]/div')
    # closeButton.click()


#########################################################3




def run():
    try:
        while (1):
            running = driver.execute_script("return window.localStorage.getItem('isRunning')")
            
            if (running == "false"):
                time.sleep
                continue

            move_player()
            attack_mob()
            auto_fight()
            
            close_alert()
            solve_captcha()

            
    except TimeoutException:
        driver.navigate.to(driver.getCurrentURL())
        time.sleep(5)
        run()


time.sleep(1)

run()



# pre-captcha (id) - container with button and timer (60 seconds)
# captcha__image (class) - image container with captcha img inside


