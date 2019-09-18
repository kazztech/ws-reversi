"user strict";
const SERVER_PORT = 80;
const REDIS_PORT = 6379;
const REDIS_HOST = "0.0.0.0";
const PUBLIC_DIR = __dirname + "/public";

const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const redis = require("redis");

const app = express();
const server = http.Server(app);
const io = socketIO(server);
const redisClient = redis.createClient(REDIS_PORT, REDIS_HOST);

// 接続
io.on("connection", (socket) => {
    // ルーム参加リクエスト
    socket.on("join-room", (joinRoomValue) => {
        let room = joinRoomValue.roomName;
        if(room.length < 6 || 12 < room.length) return;
        // ルーム参加
        socket.join(room);
        console.log("join (" + room + ") " + socket.id + "\n" + new Date());
        console.log("---------------------------------");
        // クライアント取得
        io.to(room).clients((_, clients) => {
            if (clients.length === 1) {
                // ルーム作成
                let roomObject = {};
                // コマ初期化
                roomObject.pieces = initPieces();
                roomObject.players = [socket.id];
                roomObject.turn = 0;
                redisClient.set(room, JSON.stringify(roomObject));
                // モード通知
                io.to(room).emit("change-mode", {
                    mode: "wait",
                    turn: 0
                });
            } else if (clients.length === 2) {
                // ゲーム開始
                // モード通知
                io.to(room).emit("change-mode", {
                    mode: "start",
                    turn: 1
                });
                //
                redisClient.get(room, (_, value) => {
                    let roomObject = JSON.parse(value);
                    roomObject.players.push(socket.id);
                    io.to(room).emit("update-pieces", {
                        pieces: roomObject.pieces,
                        nextTurn: 0
                    });
                    redisClient.set(room, JSON.stringify(roomObject));
                });
            } else {
                // 人数オーバー通知
                io.to(room).emit("over-notice");
                // ルーム追い出す
                socket.leaveAll();
            }
        });
        // コマ押下情報受信
        socket.on("put-piece", (value) => {
            let x = value.x;
            let y = value.y;
            if (x < 0 || 7 < x || y < 0 || 7 < y) return;
            redisClient.get(room, (_, value) => {
                let roomObject = JSON.parse(value);
                let nextTurn = roomObject.turn === 0 ? 1 : 0;
                let setPiece = roomObject.players.indexOf(socket.id) === 1 ? 2 : 1;
                let reversePiece = setPiece === 1 ? 2 : 1;
                let reversed = false;
                let pass = true;
                if (
                    roomObject.players.indexOf(socket.id) === roomObject.turn &&
                    roomObject.pieces[y][x] === 0
                ) {
                    for (let sy = -1; sy <= 1; sy++) {
                        for (let sx = -1; sx <= 1; sx++) {
                            // ボード外に出る探索は中止
                            if (
                                (sx === 0 && sy === 0) ||
                                !(0 <= x + sx && x + sx <= 7) ||
                                !(0 <= y + sy && y + sy <= 7)
                            ) continue;
                            // 周りに敵コマが存在
                            if (roomObject.pieces[y + sy][x + sx] === reversePiece) {
                                // 次の相対位置
                                let xSearch = sx * 2;
                                let ySearch = sy * 2;
                                // その先に自コマがあるか探す
                                while (true) {
                                    // 範囲外排除
                                    if (x + xSearch < 0 || x + xSearch > 7) break;
                                    if (y + ySearch < 0 || y + ySearch > 7) break;
                                    // 進んでいる最中に空白
                                    if (roomObject.pieces[y + ySearch][x + xSearch] === 0) {
                                        break;
                                    }
                                    // 進んでいる最中に自コマ発見
                                    if (roomObject.pieces[y + ySearch][x + xSearch] === setPiece) {
                                        // ひっくり返せる場所に置いた
                                        reversed = true;
                                        // おいた場所に設置
                                        roomObject.pieces[y][x] = setPiece;
                                        // ひっくり返す数
                                        let reverseCount = Math.max(
                                            Math.abs(sx - xSearch), Math.abs(sy - ySearch)
                                        );
                                        // ひっくり返し中の作業変数
                                        let xStep = sx;
                                        let yStep = sy;
                                        // ひっくり返す
                                        while (reverseCount > 0) {
                                            roomObject.pieces[y + yStep][x + xStep] = setPiece;
                                            xStep += sx;
                                            yStep += sy;
                                            reverseCount--;
                                        }
                                        break;
                                    }
                                    xSearch += sx;
                                    ySearch += sy;
                                }
                            }
                        }
                    }
                    if (reversed) {
                        check: for (let ly = 0; ly < 8; ly++) {
                            for (let lx = 0; lx < 8; lx++) {
                                if (roomObject.pieces[ly][lx] !== 0) continue;
                                for (let sy = -1; sy <= 1; sy++) {
                                    for (let sx = -1; sx <= 1; sx++) {
                                        // ボード外に出る探索は中止
                                        if (
                                            (sx === 0 && sy === 0) ||
                                            !(0 <= lx + sx && lx + sx <= 7) ||
                                            !(0 <= ly + sy && ly + sy <= 7)
                                        ) continue;
                                        // 周りに敵コマが存在
                                        if (roomObject.pieces[ly + sy][lx + sx] === setPiece) {
                                            // 次の相対位置
                                            let xSearch = sx * 2;
                                            let ySearch = sy * 2;
                                            // その先に自コマがあるか探す
                                            while (true) {
                                                // 範囲外
                                                if (lx + xSearch < 0 || lx + xSearch > 7) break;
                                                if (ly + ySearch < 0 || ly + ySearch > 7) break;
                                                // 進んでいる最中に空白
                                                if (roomObject.pieces[ly + ySearch][lx + xSearch] === 0) {
                                                    break;
                                                }
                                                // 進んでいる最中に自コマ発見
                                                if (roomObject.pieces[ly + ySearch][lx + xSearch] === reversePiece) {
                                                    pass = false;
                                                    break check;
                                                }
                                                xSearch += sx;
                                                ySearch += sy;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // ターン切替え
                    if (reversed) {
                        if (pass) nextTurn = roomObject.turn;
                        console.log("turn", nextTurn);
                        roomObject.turn = nextTurn;
                        io.to(room).emit("update-pieces", {
                            pieces: roomObject.pieces,
                            nextTurn: nextTurn
                        });
                        redisClient.set(room, JSON.stringify(roomObject));
                    }
                }
            });
        });
        // 接続解除
        socket.on("disconnect", (disconnectValue) => {
            console.log("exit (" + room + ") " + socket.id + "\n" + new Date());
            console.log("---------------------------------");
            // クライアント取得
            io.to(room).clients((_, clients) => {
                if (clients.length === 0) {
                    // ルーム削除
                    redisClient.del(room);
                } else if (clients.length === 1) {
                    // 待機
                    // コマ初期化
                    redisClient.get(room, (_, value) => {
                        let roomObject = JSON.parse(value);
                        roomObject.pieces = initPieces();
                        roomObject.players.splice(roomObject.players.indexOf(socket.id), 1);
                        roomObject.turn = 0;
                        redisClient.set(room, JSON.stringify(roomObject));
                    });
                    // モード通知
                    io.to(room).emit("change-mode", {
                        mode: "wait",
                        turn: 0
                    });
                }
                socket.leaveAll();
            });
        });
    })
});

app.use("/", express.static(PUBLIC_DIR));
server.listen(SERVER_PORT);

// 
function initPieces() {
    return Array.apply(null, Array(8)).map((_, i) => {
        return Array.apply(null, Array(8)).map((_, j) => {
            if ((i === 3 && j === 4) || (i === 4 && j === 3)) return 1;
            if ((i === 3 && j === 3) || (i === 4 && j === 4)) return 2;
            return 0;
        });
    })
}