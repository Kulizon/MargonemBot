from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import ElementNotInteractableException
from selenium.common.exceptions import ElementClickInterceptedException
from selenium.common.exceptions import JavascriptException
from selenium.common.exceptions import NoSuchElementException
from pathfinding.core.grid import Grid
from pathfinding.finder.a_star import AStarFinder 
import random
import time
import pyautogui

def wait_random_time(min, max):
        wait_val =  random.randint(min, max)
        time.sleep(wait_val / 1000)

def hold_key(key, hold_time):
    start = time.time()
    while time.time() - start < hold_time / 1000:
        pyautogui.keyDown(key)
    pyautogui.keyUp(key)


def move_player(driver):
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

    isChangingMap = driver.execute_script("return window.localStorage.getItem('isChangingMap')")
    if (isChangingMap == "true"):
        isHere = True

    numberOfIgnoreMoves = 2
    if isChangingMap == "true":
        numberOfIgnoreMoves = 1

    moves = [[0, 0]] * (len(path) - numberOfIgnoreMoves)

    for i in range(0, len(path) - numberOfIgnoreMoves):
        moves[i] = [path[i + 1][0] -  path[i][0], path[i + 1][1] -  path[i][1]]

    if ( (len(moves) == 0 and isChangingMap == "true") or (len(moves) == 1 and moves[0][0] == 0 and moves[0][1] == 0)):
        try:
            driver.execute_script("_g('walk')")
        except ElementNotInteractableException:
            print('G is not interactable')

    last_move = None

    i = -1
    for move in moves:
        i += 1
        running = driver.execute_script("return window.localStorage.getItem('isRunning')")

        # check if mob is still here
        if i % 2 == 0:
            npcs = driver.execute_script("return JSON.parse(window.localStorage.getItem('g')).npcs")
            isHere = False

            for npc in npcs:
                if moveCords.get("end").get("x")  == npc.get("x") and moveCords.get("end").get("y")  == npc.get("y"):
                    isHere = True
                    break

        hold_time = random.randint(20, 25)

        if last_move != None:
            if (last_move[0] != move[0] and last_move[1] != last_move[1]):
                hold_time = random.randint(60, 70)
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

def close_alert(driver):
    try:
        button = driver.find_element(By.ID, "a_ok")
            
        try:
            captchaTimer = driver.find_element(By.ID, "timer")
            time.sleep(1)
        except (NoSuchElementException, ElementNotInteractableException, StaleElementReferenceException):
            try:
                button.click()
            except ElementClickInterceptedException:
                time.sleep(0.5)
                return
            

    except (NoSuchElementException, ElementNotInteractableException, StaleElementReferenceException):
        return


def auto_fight(driver):
    try:
        battle = driver.execute_script("return g.battle")
    except (StaleElementReferenceException, JavascriptException): 
        return

    if battle == False or battle == None:
        return
    elif battle.get('endBattle') == False:
            # check if dead
            # then click close button fight and 
            try:
                isDead = driver.execute_script("return g.dead")
                if isDead:
                    # click on close fight button
                    closeFightButton = driver.find_elesment(By.ID, "")
                    closeFightButton.click()
                    
            except (ElementNotInteractableException, NoSuchElementException, StaleElementReferenceException):
                print('G is not interactable')

            hold_key("f", 20)

def attack_mob(driver):
        attackMob = driver.execute_script("return JSON.parse(window.localStorage.getItem('attackMob'))")
        running = driver.execute_script("return window.localStorage.getItem('isRunning')")

        if (attackMob != True or running == "false"):
            return
        
        hold_key("e", 20)
        time.sleep(0.5)
 
        driver.execute_script("window.localStorage.setItem('attackMob', 'false');")
