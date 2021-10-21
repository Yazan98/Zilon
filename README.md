<p align="center">
  <img src="https://github.com/Yazan98/Zilon/blob/main/images/logo_png.png" width="200" height="200" />
</p>

# Zilon
### Description
Zilon is a NodeJs Project To Run Scheduled Task Checks on Github Libraries Releases 
This Project Will Check on All Cached Github Libraries inside Json File and Loop on All of them
To get Latest Version of each library and Compare it with Cached Version
Then Will Send Slack message with Latest Updates of the Library

### The Problem
The Problem I faced when I use The Libraries that I should check or Follow Someone on Twitter, Reddit or medium to get notifications on the Libraries that I'm using inside my Project, but if I didn't open any application from social media apps I will never know if any library pushed new Version on their Repository or maybe I know about this updates after 2 weeks and for this reason I need to get Notifications in the same day of the Release because some libraries are still pushing major release changes and it's really a big problem if we discover this Updates after 2 Weeks from the Release date

### Project Components
1. NodeJs (NestJs)
2. Json Files
3. Github Api V3
4. Google Maven Repository (Androidx Libraries)
5. Slack Api (Send Messages)

### Project Structure
This Project Built based on Json Files Structure The Json Files will Store the Github Libraries, Versions
and Each Day Will Start Scheduled Task to check all of them and return the updated tag, also this Project used
Github Api V3 to Loop on all Libraries 

### Files Description
| Name | Description |
| :---: | :---: |
| config.json | This File Will Store All Slack, Github Tokens and Keys |
| github-libraries.json | This File Will Store All Github Libraries to track each day |
| github-libraries-cache.json | This File Will Store All Github Libraries Versions to Compare them with Latest Release |
| google-libraries.json | This File Will Store All Androidx Libraries Information |
| google-libraries-cache.json | This File Will Cache All Androidx Libraries and Compare them with Latest Release  |
| postman_collection.json | This PostMan Collection has Androidx Requests, This Project Test Requests  |
| default Folder | This Folder has Default Libraries To Check each Day  |

### Usage
1. Clone the project
2. Fill config.json File with The Required Information
3. Run npm install
4. Run npm start:dev

```
The Required Information inside Config.json File
1. Github Application ClientId
2. Github Application Secrete Key
3. Slack App Access Token
4. Slack App Signing Key
5. Channel Id Start With # like #general
```

### Repositories
1. Github Libraries
2. Androidx Libraries

### Result
![Screenshot 2021-10-20 173745](https://github.com/Yazan98/Zilon/blob/main/images/Screenshot%202021-10-20%20173745.png?raw=true)
