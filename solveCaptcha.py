import urllib
import urllib.request
import time
import cv2
import numpy as np
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.by import By

def wait_random_time(min, max):
        wait_val =  random.randint(min, max)
        time.sleep(wait_val / 1000)
 
def detect_lines_on_image(img, i):
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


def solve_captcha(driver):
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
        res = detect_lines_on_image(tiles[i], i)
        results.append(res)

    # find text here with "nie"

    detectImagesWithLines = True
    try:
        captchaQuestion = driver.find_element(By.CLASS_NAME, "captcha__question")
        if " nie " in captchaQuestion.get_attribute('innerText') or "nieozdobione" in captchaQuestion.get_attribute('innerText') or "pozbawione" in captchaQuestion.get_attribute('innerText'):
            detectImagesWithLines = False
    except NoSuchElementException:
        print("No such element")

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

        wait_random_time(1000, 2500)

        # try:
        #     closeButton = driver.find_element(By.XPATH, '//*[@id="captcha"]/div/div[3]/div[4]/div')
        #     closeButton.click()
        # except (NoSuchElementException, StaleElementReferenceException):
        #     return


