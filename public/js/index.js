"user strict";
const canvas = document.getElementById("screen");
const createRoom = document.getElementById("create-room");
let view, socket, isTurn;

if (getParam("r")) {
    let mode, turn;
    view = new View(canvas, 640, 896); // 描画クラス
    // 接続
    socket = io.connect()
    // 表示切り替え
    canvas.style.display = "block";
    createRoom.style.display = "none";
    // room参加
    socket.emit("join-room", {
        roomName: getParam("r")
    });
    // roomイベント
    socket.on("change-mode", (changeModeValue) => {
        const TURN = {
            FIRST: 0,
            SECOND: 1
        };
        const PIECE = {
            NONE: 0,
            BLACK: 1,
            WHITE: 2
        };
        let myColor;
        mode = changeModeValue.mode;
        if (turn !== TURN.FIRST) {
            turn = changeModeValue.turn;
        }
        if (turn === TURN.FIRST) {
            myColor = PIECE.BLACK;
        } else {
            myColor = PIECE.WHITE;
        }
        view.clear(); // 描画初期化
        view.drawBoard(); // ボード描画
        view.drawHeaderText(getParam("r")); // 右上のテキスト描画
        view.drawExitButton(); // 退出ボタン描画
        view.drawLinkCopyButton();
        if (mode === "wait") {
            view.drawPieceCount(0, 0, myColor); // コマ数描画
            view.drawStatusText("Waiting..."); // 下のステータステキスト描画
        } else if (mode === "start") {
            // コマアップデート
            socket.on("update-pieces", (updatePiecesValue) => {
                let pieces = updatePiecesValue.pieces;
                let nextTurn = updatePiecesValue.nextTurn;
                let blackCount = 0;
                let whiteCount = 0;
                let statusText = "";
                //
                isTurn = turn === nextTurn;
                // コマカウント
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        if (pieces[j][i] === PIECE.NONE) continue;
                        if (pieces[j][i] === PIECE.BLACK) blackCount++;
                        if (pieces[j][i] === PIECE.WHITE) whiteCount++;
                    }
                }
                view.clear(); // 描画初期化
                view.drawBoard(); // ボード描画
                view.drawHeaderText(getParam("r")); // 右上のテキスト描画
                view.drawExitButton(); // 退出ボタン描画
                view.drawPieceCount(blackCount, whiteCount, myColor); // コマ数描画
                view.drawPiece(pieces); // コマ描画
                view.drawPieceGuide(pieces, nextTurn);
                view.drawLinkCopyButton();
                // 試合終了
                const WIN_TEXT = "WIN!!!";
                const LOSE_TEXT = "LOSE...";
                if (blackCount + whiteCount === 64) {
                    // 結果分岐
                    if (blackCount > whiteCount) {
                        statusText = turn === TURN.FIRST ? WIN_TEXT : LOSE_TEXT;
                    } else if (blackCount < whiteCount) {
                        statusText = turn === TURN.SECOND ? WIN_TEXT : LOSE_TEXT;
                    } else {
                        statusText = "DRAW";
                    }
                } else if (whiteCount === 0) {
                    statusText = turn === TURN.FIRST ? WIN_TEXT : LOSE_TEXT;
                } else if (blackCount === 0) {
                    statusText = turn === TURN.SECOND ? WIN_TEXT : LOSE_TEXT;
                } else {
                    const MY_TURN_TEXT = "Your turn";
                    const OP_TURN_TEXT = "Opponent turn"
                    console.log(turn);
                    if (turn === 0) {
                        statusText = nextTurn === TURN.FIRST ? MY_TURN_TEXT : OP_TURN_TEXT;
                    } else {
                        statusText = nextTurn === TURN.SECOND ? MY_TURN_TEXT : OP_TURN_TEXT;
                    }
                }
                view.drawStatusText(statusText);
            });
        }
    });
    // 人数オーバー通知
    socket.on("over-notice", () => {
        if (mode === undefined) {
            view.drawStatusText("over");
            view.drawExitButton(); // 退出ボタン描画
        }
    });
} else {
    canvas.style.display = "none";
    createRoom.style.display = "block";
    let roomName = document.getElementById("room-name");
    roomName.value = Math.random().toString(36).slice(-10);
    roomName.addEventListener("input", () => {
        let sendBtn = document.getElementById("send-btn");
        if (roomName.value.length < 6 || 12 < roomName.value.length) {
            sendBtn.disabled = true;
            sendBtn.style.background = "#AAAAAA";
        } else {
            sendBtn.disabled = false;
            sendBtn.style.background = "orange";
        }
    });
}
