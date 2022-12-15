# def move_player():
#     gMap = driver.execute_script("return JSON.parse(window.localStorage.getItem('gMap'))")
#     moveCords = driver.execute_script("return JSON.parse(window.localStorage.getItem('moveCords'))")

#     if gMap is None or moveCords is None:
#         print("Error: gMap or moveCords are NoneType")
#         return
#     if not(any(gMap)) or not(any(moveCords)):
#         return

#     if moveCords.get("end").get("x") == None or moveCords.get("end").get("y") == None or moveCords.get("start").get("x") == None or moveCords.get("start").get("y") == None:
#         return

#     try:
#         command = "hero.searchPath(" + str(moveCords.get("end").get("x")) +  ", " + str(moveCords.get("end").get("y")) + ")"
#         driver.execute_script(command)
#         time.sleep(0.15)

#         i = 0
#         while (driver.execute_script("return hero.isMoving") == 0):
#             i += 1
#             running = driver.execute_script("return window.localStorage.getItem('isRunning')")

#             # check if mob is still here 
#             npcs = driver.execute_script("return JSON.parse(window.localStorage.getItem('g')).npcs")
#             isHere = False

#             for npc in npcs:
#                 if moveCords.get("end").get("x")  == npc.get("x") and moveCords.get("end").get("y")  == npc.get("y"):
#                     isHere = True
#                     break

#             isChangingMap = driver.execute_script("return window.localStorage.getItem('isChangingMap')")
#             if (isChangingMap == "true"):
#                 isHere = True

#             if (running == "false" or isHere == False):
#                 heroX = driver.execute_script("return hero.x")
#                 heroY = driver.execute_script("return hero.y")

#                 stopCommand = "hero.searchPath(" + str(heroX) +  ", " + str(heroY) + ")"
#                 driver.execute_script(stopCommand)
#                 break

#             if i % 4 == 0:
#                 driver.execute_script(command)

#             time.sleep(0.25)
#     except JavascriptException:
#         print('Javscript Exception')

#     isChangingMap = driver.execute_script("return window.localStorage.getItem('isChangingMap')")

#     if moveCords.get("end").get("x")  == moveCords.get("start").get("y") and moveCords.get("end").get("y")  == moveCords.get("start").get("y") and isChangingMap == "true":
#         time.sleep(0.5)
#         driver.execute_script("window.localStorage.setItem('isChangingMap', 'false');")

    
#     if (isChangingMap == "false"):
#          driver.execute_script("window.localStorage.setItem('moveCords',  JSON.stringify({start: {}, end: {}}))")
#     driver.execute_script("window.localStorage.setItem('gMap',  JSON.stringify([]))")
#     driver.execute_script("window.localStorage.setItem('isMoving', 'false');")

