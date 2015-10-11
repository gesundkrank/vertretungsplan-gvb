# Vertretungsplan GVB

This is just a small script to fetch the newest data from the substitution plan of the Gabriele-von-Bülow-Gymnasium in 
Berlin and send email reports. Since they are using [Untis](http://www.grupet.at/HTML/start.php) for their substitution 
planning this project might also work on other websites.
 
## Install
1. Install version [git](https://git-scm.com) and [node.js](https://nodejs.org) on your machine. 
2. Download this project with `git clone https://github.com/gesundkrank/vertretungsplan-gvb.git`.
3. Move to `vertretungsplan-gvb`. 
4. Install all node dependencies with `npm install`.
5. Copy the configuration example to its final position with `cp conf.json.example conf.json` and fill it with your 
data.

## Run

Just call: 
```
node main.js
```

## Schedule cron
To automatically check the substitution plan every day you should install a cron job.

Open the cron editor with `crontab -e` and add the following line (will run from Sunday to Thursday at 18:00):

```
0 17 * * 0-4 node ~/vertretungsplan-gvb/main.js > ~/vertretungsplan-gvb.log
``` 