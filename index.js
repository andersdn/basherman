#!/usr/bin/env node

// http://panmental.de/symbols/info.htm
// http://jsfiddle.net/sindresorhus/2eLtsbey/embedded/result/
// const cliSpinners = require('cli-spinners');
// index.js

// todo - set player x back from

const process = require("process")
const readline = require("readline")
const os = require("os");
const ip = require('ip');
const evilscan = require('evilscan');
const WebSocket = require('ws');
const inquirer      = require('inquirer');
const figlet = require('figlet');
const uuidv1 = require('uuid/v1');

const fs = require('fs');
const log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});

const connections = {};

const testMap = [
'XXXXXXXXXtXXXXXXXXX',
'X   ..... .....   X',
'X X.X.X.X.X.X.X.X X',
'X ............... X',
'X.X.X.X.X.X.X.X.X X',
'X ...   ...   ... X',
'X X.X X.X.X.X.X.X X',
'X.... ............X',
'X.X.X.X.X.X.X.X.X.X',
'X.................X',
'X.X.X.X.X.X.X.X.X.X',
'X.................X',
'X X.X.X.X.X.X.X.X X',
'X ............... X',
'X X.X.X.X.X.X.X.X X',
'X ............... X',
'X X.X.X.X.X.X.X.X X',
'X   ..... .....   X',
'XXXXXXXXXtXXXXXXXXX'
];
const spawnsPoints = [
    {x:1,y:1},
    {x:1,y:17},
    {x:17,y:1},
    {x:17,y:17},
]


const updateScoreTable = (users)=>{

    readline.cursorTo(process.stdout, 1, 24);
 
 //       '  ╚════════════════════════════════════════════════════════════════════════════╝ ',
   
    let heading = '╔═════════╦═══════╗\n ║  user   ║ score ║\n ╠═════════╬═══════╣';
    let scoreTable = heading;

    Object.keys(users).forEach(u => {
        let userToScore = users[u];

        scoreTable = scoreTable + [
        colorTypes.fgWhite,
        '\n ',
        '║',
        `${userToScore.avatar}`,
        colorTypes.fgWhite + `:${userToScore.userName}        `.substring(0,8),
        '║ ',
        `  ${userToScore.deaths || 0}    `.substring(0,6),
        '║',
        ].join('');
    
    });
    scoreTable = scoreTable + '\n ╚═════════╩═══════╝';

    process.stdout.write(colorTypes.fgWhite + scoreTable)
}



const anim = {
    bomb: ["■","□","▪","▫"]
}

const arrayRand = (arr) => arr[Math.floor(Math.random()*arr.length)];


const setCharAt = (str,index,chr)=>{
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

const user = {};
const users = {};
let objects = [];

const colorTypes = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    fgBlack: "\x1b[30m",
    fgRed: "\x1b[31m",
    fgGreen: "\x1b[32m",
    fgYellow: "\x1b[33m",
    fgBlue: "\x1b[34m",
    fgMagenta: "\x1b[35m",
    fgCyan: "\x1b[36m",
    fgWhite: "\x1b[37m",
    fgLightGray: "\x1b[90m",
    fgLightRed: "\x1b[91m",
    fgLightGreen: "\x1b[92m",
    fgLightYellow: "\x1b[93m",
    fgLightBlue: "\x1b[94m",
    fgLightMagenta: "\x1b[95m",
    fgLightCyan: "\x1b[96m",
    fgLightWhite: "\x1b[97m",
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
    bgLightGray: "\x1b[100m",
    bgLightRed: "\x1b[101m",
    bgLightGreen: "\x1b[102m",
    bgLightYellow: "\x1b[103m",
    bgLightBlue: "\x1b[104m",
    bgLightMagenta: "\x1b[105m",
    bgLightCyan: "\x1b[106m",
    bgLightWhite: "\x1b[107m",
}

const theLogo = [
colorTypes.fgLightWhite, '\n',
'┌┐ ┌─┐┌─┐┬ ┬┌─┐┬─┐┌┬┐┌─┐┌┐┌', colorTypes.fgWhite, '\n',
'├┴┐├─┤└─┐├─┤├┤ ├┬┘│││├─┤│││', colorTypes.fgLightGray, '\n',
'└─┘┴ ┴└─┘┴ ┴└─┘┴└─┴ ┴┴ ┴┘└┘'
].join('');

let userColors = [
    'bgRed',
    'bgYellow',
    'bgBlue',
    'bgMagenta',
    'bgCyan'
]

const elements = {
    'X': colorTypes.reset + colorTypes.dim + colorTypes.bgLightGray + colorTypes.fgWhite + "▓" + colorTypes.reset,
    '.': colorTypes.reset + colorTypes.dim + colorTypes.fgLightWhite + "♦" + colorTypes.reset,
    ' ': colorTypes.reset + colorTypes.dim + colorTypes.fgLightWhite + " " + colorTypes.reset,
    't': colorTypes.reset + colorTypes.dim + colorTypes.fgLightGreen + "▞" + colorTypes.reset,
    'bomb': t => (colorTypes.reset + colorTypes.fgRed + t + colorTypes.reset),
    'fire': colorTypes.reset + colorTypes.fgRed + "◇" + colorTypes.reset,
}

const colorize = (color, output)=>{
    return ['\033[', color, 'm', output, '\033[0m'].join('');
}

const player = {
    dir:null,
    x:null,
    y:null
}

const drawAt = (x,y,element)=>{
    // x+1 for the border offset
    readline.cursorTo(process.stdout, x+1,y+4);
    process.stdout.write(element);
}

class Game {
    constructor() {
        
        this.cursor = 0
        this.timer = null
        this.mapInstance = [...testMap].map(e => e.split(''));
    }
    parseObject(o){
        if(o.type === 'bomb'){

            if(!o.frame) o.frame = 0;
            if(!o.ticks) o.ticks = 0;
            o.ticks = o.ticks + 1;
            o.frame = (o.frame >= anim.bomb.length-1) ? 0 : (o.frame + 1);
            readline.cursorTo(process.stdout, o.x + 1, o.y + 4);
            process.stdout.write(elements.bomb(anim.bomb[o.frame]))
            if(o.ticks >= 25 && o.ticks <= 35){
                let toDelete = [];
                
                // RIGHT
                for (var i = 0; i <= 2; i++) {
                    try{
                        if (this.mapInstance[o.x+i][o.y] === 'X') {
                           break;
                        }                        
                        //console.log(this.mapInstance,this.mapInstance[o.x+i],this.mapInstance[o.x+i][o.y]);
                        drawAt(o.x+i,o.y,elements.fire);
                        toDelete.push({'x':o.x+i,'y':o.y});
                    } catch(e){}
                }
                // LEFT
                for (var i = 0; i <= 2; i++) {
                    try{
                        if (this.mapInstance[o.x-i][o.y] === 'X') {
                           break;
                        }                        
                        //console.log(this.mapInstance,this.mapInstance[o.x+i],this.mapInstance[o.x+i][o.y]);
                        drawAt(o.x-i,o.y,elements.fire);
                        toDelete.push({'x':o.x-i,'y':o.y});
                    } catch(e){}
                }
                // DOWN
                for (var i = 0; i <= 2; i++) {
                    try{
                        if (this.mapInstance[o.x][o.y+i] === 'X') {
                           break;
                        }                        
                        //console.log(this.mapInstance,this.mapInstance[o.x+i],this.mapInstance[o.x+i][o.y]);
                        drawAt(o.x,o.y+i,elements.fire);
                        toDelete.push({'x':o.x,'y':o.y+i});
                    } catch(e){}
                }
                // UP
                for (var i = 0; i <= 2; i++) {
                    try{
                        if (this.mapInstance[o.x][o.y-i] === 'X') {
                           break;
                        }                        
                        //console.log(this.mapInstance,this.mapInstance[o.x+i],this.mapInstance[o.x+i][o.y]);
                        drawAt(o.x,o.y-i,elements.fire);
                        toDelete.push({'x':o.x,'y':o.y-i});
                    } catch(e){}
                }

                toDelete.forEach(td => {
                    Object.keys(users).forEach(u => {
                        if(!users[u].ghost && users[u].player.x === td.x && users[u].player.y === td.y){
                            users[u].deaths = (users[u].deaths || 0) + 1;
                            users[u].ghost = 20;
                            // todo: kills
                        }
                    })
                })

                if(o.ticks === 35){
                    toDelete.forEach(td => {
                        try{
                            if(this.mapInstance[td.x][td.y] === '.'){
                                this.mapInstance[td.x][td.y] = ' ';
                            }
                        } catch(e){}
                    })
                    o.expired = true;
                }
                //process.exit();
    /*

                for (var i = -2; i <= 2; i++) {
                    // todo: stop fire when we get to a wall
                    drawAt(o.x+i,o.y,elements.fire);    
                    drawAt(o.x,o.y+i,elements.fire);    
                    try{
                        if(mapInstance[o.x+i][o.y] === '.'){
                            mapInstance[o.x+i][o.y] = ' ';
                        }
                    } catch(e){}
                    try{
                        if(mapInstance[o.x][o.y+i] === '.'){
                            mapInstance[o.x][o.y+i] = ' ';
                        }
                    } catch(e){}
                   
                }
    */            
            }
        }
    }
    setKeyEvents(){
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode(true);
        process.stdin.resume();

        process.stdin.on('keypress', (str, key) => {
          if (key.ctrl && key.name === 'c') {
            console.clear();
            process.exit();
          } else {
            if(ld.isActive){

                // todo - map user back into own player instance cleaner;
                if(users[user.id]){
                    // have we got an instance of users yet?
                    player.isMoving = users[user.id].player.isMoving;    
                }
                
                // not just is moving? where should the source of truth be

                player.dir = key.name;
                switch(key.name){
                    case 'up':
                    case 'w':
                        try{
                            if(!player.isMoving && ld.mapInstance[player.x][player.y-1] !== 'X'){
                                if(ld.mapInstance[player.x][player.y-1] !== '.'){
                                    player.y -= 1; 
                                    player.isMoving = true;
                                }
                            }
                        } catch(e){/* todo: array out of bounds */}    
                    break;
                    case 'down':
                    case 's':
                        try{
                            if(!player.isMoving && ld.mapInstance[player.x][player.y+1] !== 'X'){
                                if(ld.mapInstance[player.x][player.y+1] !== '.'){
                                    player.y += 1;
                                    player.isMoving = true;
                                }
                            }
                        } catch(e){/* todo: array out of bounds */}
                    break;
                    case 'left':
                    case 'a':
                        try{
                            if(!player.isMoving && ld.mapInstance[player.x-1][player.y] !== 'X'){
                                if(ld.mapInstance[player.x-1][player.y] === 'p'){
                                    player.x = ld.mapInstance[0].length - 1 - player.x;
                                    player.isMoving = true;
                                } else if(ld.mapInstance[player.x-1][player.y] !== '.'){
                                    player.x -= 1;
                                    player.isMoving = true;
                                }
                            }
                        } catch(e){/* todo: array out of bounds */}
                    break;
                    case 'right':
                    case 'd':
                        try{
                            if(!player.isMoving && ld.mapInstance[player.x+1][player.y] !== 'X'){
                                if(ld.mapInstance[player.x+1][player.y] !== '.'){
                                    player.x += 1;
                                    player.isMoving = true;
                                }
                            }
                        } catch(e){/* todo: array out of bounds */}
                    break;
                    case 'b':
                        let newBomb = {
                            x:player.x,
                            y:player.y,
                            owner:user.id,
                            type:'bomb'
                        };
                        if(!connections.wss){                    
                            // no server - assume client
                            connections.ws.send(JSON.stringify({action:'object',object:newBomb}));
                        } else {
                            // i am the server i guess?
                            objects.push(newBomb)
                        }
                    break;
                }


                let myDeaths = user.player.deaths || 0; // save to re-assign
                let myGhost = user.player.ghost || false; // save to re-assign
                user.player = Object.assign(user.player || {}, player, {deaths:myDeaths,ghost:myGhost});
                if(!connections.wss){                    
                    // no server - assume client
                    connections.ws.send(JSON.stringify({action:'user',user}));
                } else {
                    // i am the server i guess?
                    users[user.id] = user;
                }
                
            }

          }
        });


        process.stdin.on('keyup', (str, key) => {
            if(ld.isActive) player.dir = false;
        });
    }
    start() {

        
        console.clear();
        process.stdout.write("\x1B[?25l")

        if(connections.wss){
            users[user.id] = user;
        }
        
        this.isActive = true;
        
        this.timer = setInterval(() => {

            readline.cursorTo(process.stdout, 0, 0);
            console.log(theLogo);

            readline.cursorTo(process.stdout,0,5);
            
            
            
            

            for (let i = 0; i < this.mapInstance.length; i++) {
                let row = this.mapInstance[i];

                

                for (let x = 0; x < row.length; x++) {
                    //console.log(i,x,row[x]);
                    
                    
                    readline.cursorTo(process.stdout, i+1, x+4);
                    //process.stdout.write(row[x])
                    if(!!elements[row[x]]){
                        process.stdout.write(elements[row[x]])    
                    } else {
                        process.stdout.write(' ');
                    }
                    
                    
                }

                // if(i === 0){
                //     readline.cursorTo(process.stdout, 0, i);
                //     process.stdout.write('╔═══════════════════╗');    
                // } else if (i === this.mapInstance.length){
                //     readline.cursorTo(process.stdout, 0, i+1);
                //     process.stdout.write('╔═══════════════════╗');    
                // }
                
            }

            objects = objects.filter(o => !o.expired);
            // objects
            objects.forEach((o,i) => {
                this.parseObject(o);
            });

            // player
            Object.keys(users).forEach(u => {

                if(!users[u].player.x && !users[u].player.y){                   
                    let sp = spawnsPoints[Object.keys(users).length]
                    if(sp){
                        users[u].player.x = sp.x;
                        users[u].player.y = sp.y;        
                    } else {
                        // users[u]
                        // todo - lobby or queue
                    }         
                }

                if(!users[u].player){
                    console.log('missing player');
                    console.log(users[u]);
                    process.exit();
                }
                if(!!users[u].ghost){
                    users[u].ghost -= 1; 
                }
                readline.cursorTo(process.stdout, users[u].player.x + 1, users[u].player.y + 4);
                process.stdout.write(users[u].ghost ? users[u].ghostAvatar : users[u].avatar);
                users[u].player.isMoving = false;    
            });

            // we are the server - update the state and send it out
            if(connections.wss){
                connections.wss.clients.forEach(function each(client) {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        action:'state',
                        users,
                        objects,
                        mapInstance : ld.mapInstance
                    }));
                  }
                });
            }

            updateScoreTable(users);
            

        }, 125)


    }
}

const ld = new Game()

const scanForServers = async () => await new Promise((resolve, reject) => {
    var options = {
        target:ip.address() + '/24',//'127.0.0.1',
        port:'4444',
        status:'O', // Timeout, Refused, Open, Unreachable
        banner:true
    };
    var scanner = new evilscan(options);
    const servers = [];
    scanner.on('result',function(data) {
        servers.push(data);
        // fired when item is matching options
    });
    scanner.on('error',function(err) {
        reject(err);
    });
    scanner.on('done',function() {
        // finished !
        let scannedServers = servers.filter(s => s.status === 'open').map(s => {
            s.label = `Join Server: ${s.ip}`;
            return s;
        });
        resolve(scannedServers);
    });
    scanner.run();
})

const connectToServer = (ip) => {

    const ws = new WebSocket('ws://' + ip + ':4444');

    connections.ws = ws;

    ws.on('open', function open() {
      ws.send(JSON.stringify({action:'join',user}));
    });

    ws.on('message', function incoming(message) {
        try{
            let messageSent = JSON.parse(message);
            switch(messageSent.action){
                case 'state':
                    Object.keys(messageSent.users).forEach(u => {
                        users[messageSent.users[u].id] = messageSent.users[u];
                    });

                    objects = messageSent.objects;
                    ld.mapInstance = messageSent.mapInstance

                    // map user back to chosn spawn point if it has no location
                    if(!player.x && !player.y){
                        player.x = users[user.id].player.x;
                        player.y = users[user.id].player.y;
                    }
                    

                break;
            }
        } catch(e){
            console.error(message,'\r\n',e);
            process.exit();
        }
    });

    startGame();
};

const createServer = ()=> {

    const wss = new WebSocket.Server({
      port: 4444
    });



    connections.wss = wss;

    wss.on('connection', function connection(ws) {
      console.log('connection: %s', ws);
      connections.ws = ws;
      ws.on('message', function incoming(message) {
        try{
            let messageSent = JSON.parse(message);
            switch(messageSent.action){
                case 'join':
                case 'user':            
                    userSent = messageSent.user;
                    users[userSent.id] = userSent;
                break;
                case 'state':
                    Object.keys(messageSent.users).forEach(u => {
                        users[u.id] = u;
                    });
                    objects = messageSent.objects;
                break;
                case 'object':
                    objects.push(messageSent.object)
                break;
            }
        } catch(e){
            console.error(message,'\r\n',e);
            process.exit();
        }
      });
      ws.send('{}');
    });

    startGame();
}

const parseServer = (server) => {
    switch(server){
        case 'create':
            createServer();
        break;
        case 'find':
            findServers();
        break;
        case 'quit':
            console.clear();
            console.log('K THX Bai');
            process.exit();
        break;
        default:
            connectToServer(server);
    }
}

const createUser = (userName) => {
    user.id = uuidv1();
    user.player = player;
    user.userName = userName;
    user.initial = userName.substring(0,1);
    user.color = arrayRand(userColors);
    user.avatar = colorTypes.reset + colorTypes.fgWhite + colorTypes[user.color] + user.initial + colorTypes.reset;
    user.ghostAvatar = colorTypes.reset + colorTypes.dim + colorTypes.fgWhite + colorTypes[user.color] + user.initial + colorTypes.reset;
}

const findServers = async()=>{

    console.clear();
    console.log(theLogo);
    console.log(`Hi [${user.avatar}] ${user.userName} - We are just checking for servers on your local network`);

    const foundServers = await scanForServers();

    console.clear();
    console.log(theLogo);

    // console.log('foundServers','ws://' + foundServers[0].ip + ':4444')
    let message = 'Please Select or create a server to start';
    
    if(foundServers.length){
        defaultValue = foundServers[0].ip;

        inquirer.prompt(
            [{
                type: 'list',
                name: 'server',
                message: 'Choose a server to start:',
                choices: [
                    ...foundServers.map(s => {return{name:s.label,value:s.ip}}),
                    {name:'Create Server',value:'create'},
                    {name:'Search Again',value:'find'},
                    {name:'Quit',value:'quit'}
                ],
                defaultValue
            }]
        ).then(function( answer ) {
            parseServer(answer.server)
        });

    } else {
        message + '\n No Servers found on your local network, please create a server to start.'

        inquirer.prompt(
            [{
                type: 'list',
                name: 'server',
                message: 'No Servers found on your local network, would you like to create a server to start?',
                choices: [
                    {name:'Create Server',value:'create'},
                    {name:'Search Again',value:'find'},
                    {name:'Quit',value:'quit'}
                ],
                defaultValue: 'create'
            }]
        ).then(function( answer ) {
            parseServer(answer.server)
        });

    }
}

const setupMenu = async ()=>{
    
    console.clear();
    console.log(theLogo);

    

    const userName = await inquirer.prompt({
        type: 'input',
        name: 'userName',
        message: "UserName (First Character will be your in game avatar)",
        default: function() {
          let hostname = os.hostname();
          return hostname;
        },
        validate: i => (!i.length) ? 'Atleast one character' : true
    }).then(u => u.userName)

    createUser(userName);

    console.clear();
    console.log(theLogo);
    const createOrJoin = await inquirer.prompt({
            type: 'list',
            name: 'createOrJoin',
            message: `Ok [${user.avatar}] ${userName}, lets get you started. Did you want to join or create a server?`,
            choices: [
                {name:'Create Server',value:'create'},
                {name:'Join Server',value:'join'},
                {name:'Quit',value:'quit'}
            ],
            defaultValue: 'create'
        }
    ).then(a => a.createOrJoin);


    if(createOrJoin !== 'join'){
        return parseServer(createOrJoin)
    }


    findServers();



}

setupMenu();




const startGame = ()=>{

    
    ld.start()
    ld.setKeyEvents();

    readline.cursorTo(process.stdout, 1, 23);
    process.stdout.write(colorTypes.fgWhite + "[w s a d] or [↓ ↑ ← →] to move. [b] to drop bomb. ctrl+c to quit")





}




