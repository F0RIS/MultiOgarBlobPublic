# MultiOgarBlob
Ogar game server with fast and smooth vanilla physics and multi-protocol support.

Current version: **1.2.69.6**

## Install

You can use this repository via special [Blob server app](https://blobgame.github.io) (Android 5.0+) which don't demand from you to write any command!

But if you want use this repository manually, read info below.

#### Windows:
* Download and install node.js: https://nodejs.org/en/download/ (64-bit recommended)
* Download this repository as zip to your PC
* Unzip MultiOgar code into some folder
* Start command line and execute from MultiOgar folder
```
npm install
```
and run the server:
```
cd src
node index.js
```

#### Android/Linux:
```
# Install from Google Play Termux and run it
```

https://play.google.com/store/apps/details?id=com.termux
```
# Update package list
apt-get update

# Install nodejs and git:
apt-get install nodejs git -y

# Clone this repository:
git clone git://github.com/F0RIS/MultiOgarBlobPublic.git

# Install dependencies:
cd MultiOgarBlobPublic
npm install

# Run the server:
cd src
node index.js

# Add bots by typing next command
addbot 50

# To see all comand type
help

# Next time to start server you need do only 
cd MultiOgarBlobPublic/src
node index.js
```


## How to change game mode
```
# To do that you should execute next command
node index.js -m <number>
```
Where number is 

| id  | Game Mode |
| ----- | ------------- |
| 1 | Teams |
| 2 | Experimental|
| 3 | InstantMerge |
| 4 | OldCrazy |
| 5 | SelfFeed |
| 6 | Ultra |
```
# For example:
node index.js -m 3
```
Will run server with <b>InstantMerge</b> game mode



## How to connect from Blob:
```
# Run Blob
# Tap on ip and then make long tap on "Save ip for this session"
# IP will be changed to 127.0.0.1:1111
# Click Ok
# Click Play
```


## How to play with friends who on same Wi-Fi 

##### 1 Find out your Wi-Fi IP address:
  You can check it in Settings > About > Status. 
  There are can be a lot of addresses, 
  choose something similar to 192.168.0.X or 192.168.1.X

##### 2 Run server
```
node index.js
```
##### 3 Give that IP address to your friends:
Don't forget add port number at the end, for example - `192.168.0.5:1111`

##### Run Blob and play


## How to play with friends without any available Wi-Fi network

##### 1 Create Wi-Fi hotspot on your phone and ask your friends connect to it

##### 2 Find out your hotspot IP
You can check it in Settings > About > Status. 
But that screen can show your internet address which isn't your hotspot address

So if you still need your hotspot address, execute in termux next command
```
ifconfig | grep "inet addr"
```
Choose IP address which is similar to 192.168.43.1

##### 3 Run server
```
node index.js
```

##### 4 Give that IP address to your friends
Don't forget add port number at the end - `192.168.43.1:1111`

##### 5 Run Blob and play
