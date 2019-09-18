/**
 * View(canvasエレメント, canvas横幅, 縦幅)
 * canvasのcontextに描画するクラス
 */
class View {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.canvas.width = width;
        this.canvas.height = height;
        this.copyImage = new Image();
        this.copyImage.src = "../../img/copy.png";
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawBoard() {
        // 
        let gradient;
        gradient = this.context.createRadialGradient(320, 448, 0, 320, 448, 400);
        gradient.addColorStop(0, "#05CD4B");
        gradient.addColorStop(1, "#00561C");
        this.context.fillStyle = gradient;
        this.context.fillRect(20, 148, 600, 600);
        //
        for (let i = 0; i < 7; i++) {
            this.context.beginPath();
            this.context.moveTo(20, 75 * i + 223);
            this.context.lineTo(620, 75 * i + 223);
            this.context.strokeStyle = "black";
            this.context.lineWidth = 2;
            this.context.stroke();
            this.context.beginPath();
            this.context.moveTo(95 + 75 * i, 148);
            this.context.lineTo(95 + 75 * i, 748)
            this.context.strokeStyle = "black";
            this.context.lineWidth = 2;
            this.context.stroke();
        }
        //
        this.context.beginPath();
        this.context.fillStyle = "rgb(0, 0, 0)";
        this.context.arc(170, 298, 4, 0, Math.PI * 2, true);
        this.context.fill();
        //
        this.context.beginPath();
        this.context.fillStyle = "rgb(0, 0, 0)";
        this.context.arc(470, 298, 4, 0, Math.PI * 2, true);
        this.context.fill();
        //
        this.context.beginPath();
        this.context.fillStyle = "rgb(0, 0, 0)";
        this.context.arc(170, 598, 4, 0, Math.PI * 2, true);
        this.context.fill();
        //
        this.context.beginPath();
        this.context.fillStyle = "rgb(0, 0, 0)";
        this.context.arc(470, 598, 4, 0, Math.PI * 2, true);
        this.context.fill();
    }
    drawPiece(pieces) {
        const PIECE_SIZE = 29;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (pieces[j][i] === 0) continue;
                let posX = 20 + 75 / 2 + 75 * i;
                let posY = 148 + 75 / 2 + 75 * j;
                this.context.beginPath();
                if (pieces[j][i] === 1) this.context.fillStyle = "rgb(255, 255, 255)";
                if (pieces[j][i] === 2) this.context.fillStyle = "rgb(0, 0, 0)";
                this.context.arc(posX, posY + 2, PIECE_SIZE, 0, Math.PI * 2, true);
                this.context.fill();
                this.context.beginPath();
                if (pieces[j][i] === 1) this.context.fillStyle = "rgb(0, 0, 0)";
                if (pieces[j][i] === 2) this.context.fillStyle = "rgb(255, 255, 255)";
                this.context.arc(posX, posY - 2, PIECE_SIZE, 0, Math.PI * 2, true);
                this.context.fill();
            }
        }
    }
    drawPieceCount(black, white, myself) {
        const PIECE = {
            NONE: 0,
            BLACK: 1,
            WHITE: 2
        };
        const PIECE_SIZE = 37.5;
        const OWN_X = 60;
        const OWN_Y = 76;
        const OPPONENT_X = 580;
        const OPPONENT_Y = 820;
        let whiteX, whiteY, blackX, blackY;
        if (myself === PIECE.BLACK) {
            blackX = OPPONENT_X;
            blackY = OPPONENT_Y;
            whiteX = OWN_X;
            whiteY = OWN_Y;
        } else {
            whiteX = OPPONENT_X;
            whiteY = OPPONENT_Y;
            blackX = OWN_X;
            blackY = OWN_Y;
        }
        // 
        this.context.beginPath();
        this.context.strokeStyle = "white";
        this.context.lineWidth = 3;
        this.context.arc(blackX, blackY, PIECE_SIZE, 0, Math.PI * 2, true);
        this.context.stroke();
        //
        this.context.fillStyle = "white";
        this.context.font = "28px 'M PLUS Rounded 1c'";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(black, blackX, blackY, 40);
        //
        this.context.beginPath();
        this.context.fillStyle = "white";
        this.context.arc(whiteX, whiteY, PIECE_SIZE, 0, Math.PI * 2, true);
        this.context.fill();
        //
        this.context.fillStyle = "black";
        this.context.font = "28px 'M PLUS Rounded 1c'";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(white, whiteX, whiteY, 40);
    }
    drawHeaderText(roomName) {
        //
        this.context.fillStyle = "white";
        this.context.font = "28px 'M PLUS Rounded 1c'";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText("ROOM: " + roomName, 320, 80, 360);
    }
    drawStatusText(text) {
        this.context.fillStyle = "white";
        this.context.font = "36px 'M PLUS Rounded 1c'";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText(text, 320, 820, 300);
    }
    drawExitButton() {
        this.context.beginPath();
        this.context.moveTo(75, 795);
        this.context.lineTo(20, 820);
        this.context.lineTo(75, 845);
        this.context.closePath();
        this.context.fill();
        //
        this.context.fillStyle = "black";
        this.context.font = "16px 'M PLUS Rounded 1c'";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText("EXIT", 55, 820, 40);
    }
    drawPieceGuide(pieces, turn) {
        for (let x = 0; x < pieces.length; x++) {
            pieceLoop: for (let y = 0; y < pieces[x].length; y++) {
                //
                if (pieces[y][x] === 0) {
                    // 設置する色
                    let setPiece = (turn === 0 ? 1 : 2);
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            // もろもろ排除
                            if (
                                (i === 0 && j === 0) ||
                                (x === 0 && j === -1) ||
                                (x === 7 && j === 1) ||
                                (y === 0 && i === -1) ||
                                (y === 7 && i === 1)
                            ) continue;
                            // 周りに敵コマが存在
                            if (
                                pieces[y + i][x + j] === (turn !== 0 ? 1 : 2)
                            ) {
                                // 次の相対位置
                                let iSearch = i * 2;
                                let jSearch = j * 2;
                                // その先に自コマがあるか探す
                                while (true) {
                                    // 範囲外排除
                                    if (y + iSearch < 0 || y + iSearch > 7) break;
                                    if (x + jSearch < 0 || x + jSearch > 7) break;
                                    // 進んでいる最中に空白
                                    if (pieces[y + iSearch][x + jSearch] === 0) {
                                        break;
                                    }
                                    // 進んでいる最中に自コマ発見
                                    if (pieces[y + iSearch][x + jSearch] === setPiece) {
                                        this.context.fillStyle = "rgba(255, 255, 0, 0.6)";
                                        this.context.fillRect(x * 75 + 21, y * 75 + 149, 73, 73);
                                        continue pieceLoop;
                                    }
                                    iSearch += i;
                                    jSearch += j;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    drawLinkCopyButton() {
        this.context.drawImage(this.copyImage, 565, 55, 32, 32);
        //
        this.context.fillStyle = "white";
        this.context.font = "16px 'M PLUS Rounded 1c'";
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.fillText("Copy", 580, 100, 60);
    }
}