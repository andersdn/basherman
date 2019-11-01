#!/usr/bin/env node

// http://panmental.de/symbols/info.htm
// http://jsfiddle.net/sindresorhus/2eLtsbey/embedded/result/
// const cliSpinners = require('cli-spinners');
// index.js
const process = require("process")
const readline = require("readline")

const testMap = [
'XXXXXXXXXXXXXXXXXXX',
'X   ...........   X',
'X X.X.X.X.X.X.X.X X',
'X ............... X',
'X.X.X.X.X.X.X.X.X.X',
'X.................X',
'X.X.X.X.X.X.X.X.X.X',
'X.................X',
'X.X.X.X.X.X.X.X.X.X',
'X.................X',
'X.X.X.X.X.X.X.X.X.X',
'X.................X',
'X.X.X.X.X.X.X.X.X.X',
'X.................X',
'X.X.X.X.X.X.X.X.X.X',
'X................ X',
'X X.X.X.X.X.X.X.X X',
'X   ...........   X',
'XXXXXXXXXXXXXXXXXXX'
];

const anim = {
    bomb: ["■","□","▪","▫"]
}

const setCharAt = (str,index,chr)=>{
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

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

const elements = {
    'X': colorTypes.reset + colorTypes.dim + colorTypes.fgWhite + "▓" + colorTypes.reset,
    '.': colorTypes.reset + colorTypes.dim + colorTypes.fgLightWhite + "░" + colorTypes.reset,
    ' ': colorTypes.reset + colorTypes.dim + colorTypes.fgLightWhite + " " + colorTypes.reset,
    'bomb': t => (colorTypes.reset + colorTypes.fgRed + t + colorTypes.reset),
    'fire': colorTypes.reset + colorTypes.fgRed + "◇" + colorTypes.reset,
}

const colorize = (color, output)=>{
    return ['\033[', color, 'm', output, '\033[0m'].join('');
}

const player = {
    dir:null,
    x:1,
    y:1
}

const drawAt = (x,y,element)=>{
    readline.cursorTo(process.stdout, x,y);
    process.stdout.write(element);
}

class Game {
    constructor(size) {
        this.size = size
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
            readline.cursorTo(process.stdout, o.x, o.y);
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
                    if(player.x === td.x && player.y === td.y){
                        console.clear();
                        console.log('Tech demo with no other players and you manage to die? seriously dude?');
                        process.exit();
                    }
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
    start() {

        
        console.clear();
        process.stdout.write("\x1B[?25l")
        
        
        this.timer = setInterval(() => {

            readline.cursorTo(process.stdout,0,0)
            
            for (let i = 0; i < this.mapInstance.length; i++) {
                let row = this.mapInstance[i];
                for (let x = 0; x < row.length; x++) {
                    //console.log(i,x,row[x]);
                    readline.cursorTo(process.stdout, i, x);
                    //process.stdout.write(row[x])
                    if(!!elements[row[x]]){
                        process.stdout.write(elements[row[x]])    
                    } else {
                        process.stdout.write(' ');
                    }
                    
                    
                }
                
            }

            objects = objects.filter(o => !o.expired);
            // objects
            objects.forEach((o,i) => {
                this.parseObject(o);
            })

            // player
            readline.cursorTo(process.stdout, player.x, player.y);
            process.stdout.write("A")

        }, 125)


    }
}

const ld = new Game(64,64)
ld.start()

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    console.clear();
    process.exit();
  } else {
    player.dir = key.name;
    switch(key.name){
        case 'up':
        case 'w':
            if(ld.mapInstance[player.x][player.y-1] !== 'X' && ld.mapInstance[player.x][player.y-1] !== '.') player.y -= 1; 
        break;
        case 'down':
        case 's':
            if(ld.mapInstance[player.x][player.y+1] !== 'X' && ld.mapInstance[player.x][player.y+1] !== '.') player.y += 1;
        break;
        case 'left':
        case 'a':
            if(ld.mapInstance[player.x-1][player.y] !== 'X' && ld.mapInstance[player.x-1][player.y] !== '.') player.x -= 1;
        break;
        case 'right':
        case 'd':
            if(ld.mapInstance[player.x+1][player.y] !== 'X' && ld.mapInstance[player.x+1][player.y] !== '.') player.x += 1;
        break;
        case 'b':
            objects.push({
                x:player.x,
                y:player.y,
                type:'bomb'
            })
        break;
    }

  }
});


process.stdin.on('keyup', (str, key) => {
    player.dir = false;
});

readline.cursorTo(process.stdout, 1, 20);
process.stdout.write("[w s a d] or [↓ ↑ ← →] to move. [b] to drop bomb. ctrl+c to quit")
readline.cursorTo(process.stdout, 1, 21);
process.stdout.write("there is nothing here yet, so you can't do much")

